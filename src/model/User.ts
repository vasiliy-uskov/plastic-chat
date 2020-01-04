import {generateUUId} from "../core/utils/UUIDUtils";
import {Pool} from "mysql";
import {buildGetRowQuery, buildIdComparingCondition, buildInsertQuery, buildSetRowQuery} from "../core/bd/SqlBuilder";
import {File} from "./File";

export class User {
	private constructor(id: string, firstName: string, lastName: string, email: string, password: string, avatarId: string|null = null, wasInserted = false) {
		this._id = id;
		this._email = email;
		this._firstName = firstName;
		this._lastName = lastName;
		this._password = password;
		this._avatarId = avatarId;
		this._wasInserted = wasInserted;
	}

	id(): string {
		return this._id;
	}

	email(): string {
		return this._email;
	}

	firstName(): string {
		return this._firstName;
	}

	lastName(): string {
		return this._lastName;
	}

	password(): string {
		return this._password;
	}

	async avatar(connection: Pool): Promise<File | null> {
		if (!this._avatarId) {
			return Promise.resolve(null);
		}
		if (!this._avatar) {
			this._avatar = await File.get(connection, this._avatarId);
		}
		return this._avatar;
	}

	setFirstName(firstName: string) {
		this._firstName = firstName;
	}

	setLastName(lastName: string) {
		this._lastName = lastName;
	}

	setPassword(password: string) {
		this._password = password;
	}

	setAvatar(avatar: File) {
		this._avatar = avatar;
		this._avatarId = avatar.id();
	}

	save(connection: Pool): Promise<void> {
		if (this._wasInserted) {
			return buildSetRowQuery(connection, {
				table: 'user',
				condition: buildIdComparingCondition('user_id', this._id),
				values: {
					'first_name': this._firstName,
					'last_name': this._lastName,
					'password': this._firstName,
					'avatar_id': this._avatarId,
				}
			});
		}
		return buildInsertQuery(connection, 'user', [{
			'user_id': `UNHEX(${this._id})`,
			'email': this._email,
			'first_name': this._firstName,
			'last_name': this._lastName,
			'password': this._firstName,
			'avatar_id': this._avatarId,
		}]).then(() => {
			this._wasInserted = true;
		})
	}

	static creat(firstName: string, lastName: string, email: string, password: string): User {
		return new User(generateUUId(), firstName, lastName, email, password);
	}

	static createFromRowData(rowData: any): User {
		return new User(
			rowData.user_id,
			rowData.first_name,
			rowData.last_name,
			rowData.email,
			rowData.password,
			rowData.avatar_id,
			true
		);
	}

	static get(connection: Pool, id: string): Promise<User> {
		return buildGetRowQuery(connection, {
			table: 'user',
			condition: buildIdComparingCondition('user_id', id),
			fields: ['user_id', 'email', 'first_name', 'last_name', 'password', 'avatar_id'],
			mapper: User.createFromRowData,
		})
	}

	private readonly _id: string;
	private readonly _email: string;

	private _lastName: string;
	private _password: string;
	private _firstName: string;
	private _avatar: File | null = null;
	private _avatarId: string | null;
	private _wasInserted: boolean;
}
