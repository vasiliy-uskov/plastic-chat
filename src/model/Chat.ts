import {Pool} from "mysql";
import {buildAndCondition, buildDeleteRowQuery, buildEqualCondition, buildGetRowQuery, buildInsertQuery, buildLeftJoin, buildLeftJoinCondition, buildSetRowQuery, SortingOrder} from "../core/bd/SqlBuilder";
import {generateUUId} from "../core/utils/UUIDUtils";
import {User} from "./User";
import {Message} from "./Message";
import {File} from "./File";

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
			table: buildLeftJoin('chat_has_user', 'user', buildLeftJoinCondition('chat_has_user', 'user', 'user_id')),
			condition: buildEqualCondition('chat_id', this._id),
			fields: ['user_id', 'email', 'first_name', 'last_name', 'password', 'avatar_id'],
			mapper: (result: any) => result.map(User.createFromRowData),
		})
	}

	async messages(connection: Pool, page: number, pageMessagesCount: number): Promise<Array<{message: Message, addresser: User, avatar: File|null}>> {
		const table = buildLeftJoin(
			buildLeftJoin(
				'message',
				'user',
				buildLeftJoinCondition('message', 'user', 'addresser_id', 'user_id')
			),
			'file',
			buildLeftJoinCondition('user', 'file', 'avatar_id', 'file_id')
		);
		return buildGetRowQuery(connection, {
			table,
			condition: buildEqualCondition('chat_id', this._id),
			fields: [
				'message_id', 'text', 'chat_id', 'send_date', 'addresser_id',
				'user_id', 'email', 'first_name', 'last_name', 'gender', 'password', 'avatar_id',
				'file_id', 'file_name', 'creating_date'
			],
			sort: {
				columnName: 'send_date',
				order: SortingOrder.DESCEND,
			},
			offset: page * pageMessagesCount,
			limit: pageMessagesCount,
			mapper: (result: any) => result.map((rowData: any) => ({
				message: Message.createFromRowData(rowData),
				addresser: User.createFromRowData(rowData),
				avatar: rowData.file_id ? File.createFromRowData(rowData) : null,
			})),
		})
	}

	async addUsers(connection: Pool, usersIds: Array<string>): Promise<void> {
		const addedUsersIds = (await this.users(connection)).map(user => user.id());
		usersIds = usersIds.filter(id => !addedUsersIds.includes(id));
		if (!usersIds.length) {
			return Promise.resolve();
		}
		return buildInsertQuery(connection, 'chat_has_user', usersIds.map(userId => ({
			'chat_has_user_id': generateUUId(),
			'chat_id': this._id,
			'user_id': userId,
		})));
	}

	async removeUsers(connection: Pool, usersIds: Array<string>): Promise<void> {
		const addedUsersIds = (await this.users(connection)).map(user => user.id());
		usersIds = usersIds.filter(id => addedUsersIds.includes(id));
		if (!usersIds.length) {
			return Promise.resolve();
		}
		return buildDeleteRowQuery(connection, {
			table: 'chat_has_user',
			condition: buildAndCondition(
				buildEqualCondition('chat_id', this._id),
				...usersIds.map(id => buildEqualCondition('user_id', id))
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

	delete(connection: Pool): Promise<void> {
		return buildDeleteRowQuery(connection, {
			table: 'chat',
			condition: buildEqualCondition('chat_id', this._id),
		});
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