import {Pool} from "mysql";
import {generateUUId} from "../core/utils/UUIDUtils";
import {buildGetRowQuery, buildEqualCondition, buildInsertQuery, buildSetRowQuery, buildLeftJoin, buildLeftJoinCondition, buildAndCondition, buildDeleteRowQuery} from "../core/bd/SqlBuilder";
import {User} from "./User";

export enum UsersRelationshipType {
	BLACKLIST = 0,
	SUBSCRIBER = 1,
	FRIEND = 2,
}

export class UsersRelationship {
	private constructor(id: string, relationshipType: UsersRelationshipType, leftUserId: string, rightUserId: string, wasInserted = false) {
		this._id = id;
		this._relationshipType = relationshipType;
		this._leftUserId = leftUserId;
		this._rightUserId = rightUserId;
		this._wasInserted = wasInserted;
	}

	id(): string {
		return this._id;
	}

	relationshipType(): UsersRelationshipType {
		return this._relationshipType;
	}

	async leftUser(connection: Pool): Promise<User> {
		if (!this._leftUser) {
			this._leftUser = await User.get(connection, this._leftUserId);
		}
		return this._leftUser;
	}

	async rightUser(connection: Pool): Promise<User> {
		if (!this._rightUser) {
			this._rightUser = await User.get(connection, this._rightUserId);
		}
		return this._rightUser;
	}

	setRelationshipType(relationshipType: UsersRelationshipType) {
		this._relationshipType = relationshipType;
	}

	save(connection: Pool): Promise<void> {
		if (this._wasInserted) {
			return buildSetRowQuery(connection, {
				table: 'users_relationship',
				condition: buildEqualCondition('users_relationship_id', this._id),
				values: {
					'users_relationship_type': this._relationshipType,
				}
			});
		}
		return buildInsertQuery(connection, 'users_relationship', [{
			'users_relationship_id': this._id,
			'users_relationship_type': this._relationshipType,
			'left_user_id': this._leftUserId,
			'right_user_id': this._rightUserId,
		}]).then(() => {
			this._wasInserted = true;
		})
	}

	static creat(relationshipType: UsersRelationshipType, leftUserId: string, rightUserId: string): UsersRelationship {
		const id = generateUUId();
		return new UsersRelationship(id, relationshipType, leftUserId, rightUserId);
	}

	static createFromRowData(rowData: any): UsersRelationship {
		return new UsersRelationship(
			rowData.users_relationship_id,
			rowData.users_relationship_type,
			rowData.left_user_id,
			rowData.right_user_id,
			true
		)
	}

	static get(connection: Pool, id: string): Promise<UsersRelationship> {
		return buildGetRowQuery(connection, {
			table: 'users_relationship',
			condition: buildEqualCondition('users_relationship_id', id),
			fields: ['users_relationship_id', 'users_relationship_type', 'left_user_id', 'right_user_id'],
			mapper: rows => UsersRelationship.createFromRowData(rows[0]),
		})
	}

	static getList(connection: Pool, userId: string, relationshipType: UsersRelationshipType): Promise<Array<User>> {
		return buildGetRowQuery(connection, {
			table: buildLeftJoin('users_relationship', 'user', buildLeftJoinCondition('users_relationship', 'user', 'left_user_id', 'user_id')),
			condition: buildAndCondition(
				buildEqualCondition('left_user_id', userId),
				buildEqualCondition('users_relationship_type', relationshipType)
			),
			fields: ['user_id', 'email', 'first_name', 'last_name', 'password', 'gender', 'avatar_id'],
			mapper: rows => rows.map(User.createFromRowData),
		})
	}

	static async removeFriends(connection: Pool, userId: string, usersIds: Array<string>): Promise<void> {
		await UsersRelationship.remove(connection, userId, UsersRelationshipType.FRIEND, usersIds);
		await buildSetRowQuery(connection, {
			table: 'users_relationship',
			condition: buildAndCondition(
				buildEqualCondition('right_user_id', userId),
				buildEqualCondition('users_relationship_type', UsersRelationshipType.FRIEND),
				...usersIds.map(id => buildEqualCondition('left_user_id', id))
			),
			values: {
				'users_relationship_type': UsersRelationshipType.SUBSCRIBER,
			}
		})
	}

	static async addFriends(connection: Pool, userId: string, usersIds: Array<string>): Promise<void> {
		await buildSetRowQuery(connection, {
			table: 'users_relationship',
			condition: buildAndCondition(
				buildEqualCondition('left_user_id', userId),
				...usersIds.map(id => buildEqualCondition('right_user_id', id))
			),
			values: {
				'users_relationship_type': UsersRelationshipType.SUBSCRIBER,
			}
		});
		const subscribesList = await UsersRelationship.getSubscribesIds(connection, userId);
		await buildSetRowQuery(connection, {
			table: 'users_relationship',
			condition: buildAndCondition(
				buildAndCondition(
					buildEqualCondition('left_user_id', userId),
					...usersIds
						.filter(id => subscribesList.includes(id))
						.map(id => buildEqualCondition('right_user_id', id))
				),
				buildAndCondition(
					buildEqualCondition('right_user_id', userId),
					...usersIds
						.filter(id => subscribesList.includes(id))
						.map(id => buildEqualCondition('left_user_id', id))
				)
			),
			values: {
				'users_relationship_type': UsersRelationshipType.FRIEND,
			}
		});
		const subscribesToInsert = usersIds.filter(id => !subscribesList.includes(id));
		await buildInsertQuery(
			connection,
			'users_relationship',
			subscribesToInsert.map(subscribesId => ({
				'users_relationship_id': generateUUId(),
				'users_relationship_type': UsersRelationshipType.SUBSCRIBER,
				'left_user_id': userId,
				'right_user_id': subscribesId,
			}))
		);
	}

	private static async remove(connection: Pool, userId: string, relationshipType: UsersRelationshipType, usersIds: Array<string>): Promise<void> {
		await buildDeleteRowQuery(connection, {
			table: 'users_relationship',
			condition: buildAndCondition(
				buildEqualCondition('left_user_id', userId),
				buildEqualCondition('users_relationship_type', relationshipType),
				...usersIds.map(id => buildEqualCondition('right_user_id', id))
			),
		});
	}

	private static getSubscribesIds(connection: Pool, userId: string): Promise<Array<string>> {
		return buildGetRowQuery(connection, {
			table: 'users_relationship',
			condition: buildAndCondition(
				buildEqualCondition('left_user_id', userId),
				buildEqualCondition('users_relationship_type', UsersRelationshipType.SUBSCRIBER)
			),
			fields: ['right_user_id'],
			mapper: (rows: Array<{right_user_id: string}>) => rows.map(row => row.right_user_id),
		})
	}

	private readonly _id: string;
	private readonly _rightUserId: string;
	private readonly _leftUserId: string;
	private _leftUser: User | null = null;
	private _rightUser: User | null = null;
	private _relationshipType: UsersRelationshipType;
	private _wasInserted: boolean;
}