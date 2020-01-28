import {Pool} from "mysql";
import {generateUUId} from "../core/utils/UUIDUtils";
import {buildGetRowQuery, buildEqualCondition, buildInsertQuery, buildSetRowQuery, buildLeftJoin, buildLeftJoinCondition, buildAndCondition, buildDeleteRowQuery, buildOrCondition} from "../core/bd/SqlBuilder";
import {User} from "./User";
import {verify} from "../core/utils/typeutils";

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
			this._leftUser = verify(await User.get(connection, this._leftUserId));
		}
		return this._leftUser;
	}

	async rightUser(connection: Pool): Promise<User> {
		if (!this._rightUser) {
			this._rightUser = verify(await User.get(connection, this._rightUserId));
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
			table: buildLeftJoin('users_relationship', 'user', buildLeftJoinCondition('users_relationship', 'user', 'right_user_id', 'user_id')),
			condition: buildAndCondition(
				buildEqualCondition('left_user_id', userId),
				buildEqualCondition('users_relationship_type', relationshipType)
			),
			fields: ['user_id', 'email', 'first_name', 'last_name', 'password', 'gender', 'avatar_id'],
			mapper: rows => rows.map(User.createFromRowData),
		})
	}

	static async removeFriend(connection: Pool, firstUserId: string, secondUserId: string): Promise<void> {
		if (firstUserId == secondUserId) {
			return
		}
		await buildDeleteRowQuery(connection, {
			table: 'users_relationship',
			condition: buildAndCondition(
				buildEqualCondition('left_user_id', firstUserId),
				buildEqualCondition('right_user_id', secondUserId),
				buildOrCondition(
					buildEqualCondition('users_relationship_type', UsersRelationshipType.FRIEND),
					buildEqualCondition('users_relationship_type', UsersRelationshipType.SUBSCRIBER)
				),
			),
		});
		await buildSetRowQuery(connection, {
			table: 'users_relationship',
			condition: buildAndCondition(
				buildEqualCondition('left_user_id', secondUserId),
				buildEqualCondition('right_user_id', firstUserId),
				buildEqualCondition('users_relationship_type', UsersRelationshipType.FRIEND),
			),
			values: {
				'users_relationship_type': UsersRelationshipType.SUBSCRIBER,
			}
		})
	}

	static async addFriend(connection: Pool, firstUserId: string, secondUserId: string): Promise<void> {
		if (firstUserId == secondUserId) {
			return
		}
		let relationship = await UsersRelationship.getByUsers(connection, firstUserId, secondUserId);
		if (!relationship)
		{
			relationship = UsersRelationship.creat(UsersRelationshipType.SUBSCRIBER, firstUserId, secondUserId)
		}
		const reverseRelationship = await UsersRelationship.getByUsers(connection, secondUserId, firstUserId);
		if (reverseRelationship && reverseRelationship.relationshipType() == UsersRelationshipType.SUBSCRIBER)
		{
			relationship.setRelationshipType(UsersRelationshipType.FRIEND);
			reverseRelationship.setRelationshipType(UsersRelationshipType.FRIEND);
			await reverseRelationship.save(connection)
		}
		await relationship.save(connection)
	}

	private static getByUsers(connection: Pool, firstUserId: string, secondUserId: string): Promise<(UsersRelationship|null)> {
		return buildGetRowQuery(connection, {
			table: 'users_relationship',
			condition: buildAndCondition(
				buildEqualCondition('left_user_id', firstUserId),
				buildEqualCondition('right_user_id', secondUserId),
			),
			fields: ['users_relationship_id', 'users_relationship_type', 'left_user_id', 'right_user_id'],
			mapper: rows => rows[0] ? UsersRelationship.createFromRowData(rows[0]) : null,
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