import {Pool} from "mysql";
import {buildInsertQuery, buildGetRowQuery, buildEqualCondition, buildSetRowQuery, buildLeftJoin, buildCountRowQuery, buildAndCondition, buildDeleteRowQuery} from "../core/bd/SqlBuilder";
import {generateUUId} from "../core/utils/UUIDUtils";
import {User} from "./User";
import {Message} from "./Message";

export class Chat {
	private constructor(id: string, path: string, creatingDate: Date, wasInserted = false) {
		this._id = id;
		this._name = path;
		this._creatingDate = creatingDate;
		this._wasInserted = wasInserted;
	}

	id(): string {
		return this._id;
	}

	name(): string {
		return this._name;
	}

	creatingDate(): Date {
		return this._creatingDate;
	}

	async users(connection: Pool): Promise<Array<User>> {
		return buildGetRowQuery(connection, {
			table: buildLeftJoin('chat_has_user', 'user', 'user_id'),
			condition: buildEqualCondition('chat_id', this._id),
			fields: ['user_id', 'email', 'first_name', 'last_name', 'password', 'avatar_id'],
			mapper: (result: any) => result.map(User.createFromRowData),
		})
	}

	async messages(connection: Pool): Promise<Array<Message>> {
		return buildGetRowQuery(connection, {
			table: 'message',
			condition: buildEqualCondition('chat_id', this._id),
			fields: ['message_id', 'text', 'owner_id', 'chat_id', 'send_date'],
			mapper: (result: any) => result.map(Message.createFromRowData),
		})
	}

	async addUser(connection: Pool, user: User): Promise<void> {
		if (await this.hasUser(connection, user)) {
			return Promise.resolve();
		}
		return buildInsertQuery(connection, 'chat_has_user', [{
			'chat_has_user_id': generateUUId(),
			'chat_id': this._id,
			'user_id': user.id(),
		}])
	}

	async removeUser(connection: Pool, user: User): Promise<void> {
		if (!await this.hasUser(connection, user)) {
			return Promise.resolve();
		}
		return buildDeleteRowQuery(connection, {
			table: 'chat_has_user',
			condition: buildAndCondition(
				buildEqualCondition('chat_id', this._id),
				buildEqualCondition('user_id', user.id())
			),
		})
	}

	setName(name: string): void {
		this._name = name;
	}

	save(connection: Pool): Promise<void> {
		if (this._wasInserted) {
			return buildSetRowQuery(connection, {
				table: 'chat',
				condition: buildEqualCondition('chat_id', this._id),
				values: {
					'name': this._name,
				}
			});
		}
		return buildInsertQuery(connection, 'chat', [{
			'chat_id': this._id,
			'name': this._name,
			'creating_date': this._creatingDate,
		}]).then(() => {
			this._wasInserted = true;
		})
	}

	private async hasUser(connection: Pool, user: User): Promise<boolean> {
		return !!(await buildCountRowQuery(connection, {
			table: 'chat_has_user',
			condition: buildAndCondition(
				buildEqualCondition('chat_id', this._id),
				buildEqualCondition('user_id', user.id())
			),
			groupingField: 'chat_has_user_id'
		}));
	}

	static creat(name: string): Chat {
		const id = generateUUId();
		return new Chat(id, name, new Date());
	}

	static createFromRowData(rowData: any): Chat {
		return new Chat(
			rowData.chat_id,
			rowData.name,
			new Date(rowData.creating_date),
			true
		);
	}

	static get(connection: Pool, id: string): Promise<Chat> {
		return buildGetRowQuery(connection, {
			table: 'chat',
			condition: buildEqualCondition('chat_id', id),
			fields: ['chat_id', 'name', 'creating_date'],
			mapper: (rows) => Chat.createFromRowData(rows[0]),
		})
	}

	private readonly _id: string;
	private readonly _creatingDate: Date;
	private _name: string;
	private _wasInserted: boolean;
}