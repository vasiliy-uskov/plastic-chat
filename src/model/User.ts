import {generateUUId} from "../core/utils/UUIDUtils";
import {Pool} from "mysql";
import {buildAndCondition, buildEqualCondition, buildFullTextSearch, buildGetRowQuery, buildInsertQuery, buildSetRowQuery} from "../core/bd/SqlBuilder";
import {File} from "./File";

export enum Gender {
	MALE = 0,
	FEMALE = 1,
}

export function genderToString(gender: Gender): ('male'|'female') {
	switch (gender) {
		case Gender.MALE:
			return 'male';
		case Gender.FEMALE:
			return 'female';
	}
}

export function stringToGender(gender: ('male'|'female')):  Gender {
	switch (gender) {
		case 'male':
			return Gender.MALE;
		case 'female':
			return Gender.FEMALE;
	}
}

export class User {
	private constructor(id: string, firstName: string|null, lastName: string|null, email: string, password: string, gender: Gender, avatarId: string|null = null, wasInserted = false) {
		this._id = id;
		this._email = email;
		this._firstName = firstName;
		this._lastName = lastName;
		this._password = password;
		this._gender = gender;
		this._avatarId = avatarId;
		this._wasInserted = wasInserted;
	}

	id(): string {
		return this._id;
	}

	email(): string {
		return this._email;
	}

	firstName(): string|null {
		return this._firstName;
	}

	lastName(): string|null {
		return this._lastName;
	}

	password(): string {
		return this._password;
	}

	gender(): Gender {
		return this._gender;
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
				condition: buildEqualCondition('user_id', this._id),
				values: {
					'first_name': this._firstName,
					'last_name': this._lastName,
					'password': this._password,
					'avatar_id': this._avatarId,
				}
			});
		}
		return buildInsertQuery(connection, 'user', [{
			'user_id': this._id,
			'email': this._email,
			'first_name': this._firstName,
			'last_name': this._lastName,
			'password': this._password,
			'gender': this._gender,
			'avatar_id': this._avatarId,
		}]).then(() => {
			this._wasInserted = true;
		})
	}

	static creat(firstName: string|null, lastName: string|null, email: string, password: string, gender: Gender): User {
		return new User(generateUUId(), firstName, lastName, email, password, gender);
	}

	static createFromRowData(rowData: any): User {
		return new User(
			rowData.user_id,
			rowData.first_name,
			rowData.last_name,
			rowData.email,
			rowData.password,
			rowData.gender,
			rowData.avatar_id ? rowData.avatar_id : rowData.avatar_id,
			true
		);
	}

	static get(connection: Pool, id: string): Promise<User> {
		return buildGetRowQuery(connection, {
			table: 'user',
			condition: buildEqualCondition('user_id', id),
			fields: ['user_id', 'email', 'first_name', 'last_name', 'password', 'gender', 'avatar_id'],
			mapper: (rows) => User.createFromRowData(rows[0]),
		})
	}

	static find(connection: Pool, searchString: string): Promise<Array<User>> {
		return buildGetRowQuery(connection, {
			table: 'user',
			condition: buildFullTextSearch(['email', 'first_name', 'last_name'], [searchString]),
			fields: ['user_id', 'email', 'first_name', 'last_name', 'password', 'gender', 'avatar_id'],
			mapper: (rows: Array<any>) => rows.map(User.createFromRowData),
		})
	}

	static verifyLogIn(connection: Pool, email: string, password: string): Promise<User|null> {
		return buildGetRowQuery(connection, {
			table: 'user',
			condition: buildAndCondition(
				buildEqualCondition('email', email),
				buildEqualCondition('password', password)
			),
			fields: ['user_id', 'email', 'first_name', 'last_name', 'password', 'gender', 'avatar_id'],
			mapper: (rows) => rows[0] ? User.createFromRowData(rows[0]) : null,
		});
	}

	private readonly _id: string;
	private readonly _email: string;
	private readonly _gender: Gender;

	private _lastName: string|null;
	private _firstName: string|null;
	private _password: string;
	private _avatar: File | null = null;
	private _avatarId: string | null;
	private _wasInserted: boolean;
}
