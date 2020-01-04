import {Pool} from "mysql";
import {generateUUId} from "../core/utils/UUIDUtils";
import {buildGetRowQuery, buildIdComparingCondition, buildInsertQuery, buildSetRowQuery} from "../core/bd/SqlBuilder";
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
				condition: buildIdComparingCondition('users_relationship_id', this._id),
				values: {
					'users_relationship_type': this._relationshipType,
				}
			});
		}
		return buildInsertQuery(connection, 'file_access_right', [{
			'users_relationship_id': `UNHEX(${this._id})`,
			'users_relationship_type': this._relationshipType,
			'left_user_id': this._leftUserId,
			'right_user_id': this._rightUserId,
		}]).then(() => {
			this._wasInserted = true;
		})
	}

	static creat(accessRight: UsersRelationshipType, leftUserId: string, rightUserId: string): UsersRelationship {
		const id = generateUUId();
		return new UsersRelationship(id, accessRight, leftUserId, rightUserId);
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
			table: 'file_access_right',
			condition: buildIdComparingCondition('file_access_right_id', id),
			fields: ['users_relationship_id', 'users_relationship_type', 'left_user_id', 'right_user_id'],
			mapper: UsersRelationship.createFromRowData,
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