import {Pool} from "mysql";
import {buildInsertQuery, buildGetRowQuery, buildEqualCondition, buildSetRowQuery, buildDeleteRowQuery, buildLeftJoin, buildLeftJoinCondition} from "../core/bd/SqlBuilder";
import {generateUUId} from "../core/utils/UUIDUtils";
import {User} from "./User";
import {Chat} from "./Chat";
import {File} from "./File";

export class Message {
	private constructor(id: string, text: string, addresserID: string, chatId: string, sendDate: Date, wasInserted = false) {
		this._id = id;
		this._text = text;
		this._addresserId = addresserID;
		this._chatId = chatId;
		this._sendDate = sendDate;
		this._wasInserted = wasInserted;
	}

	id(): string {
		return this._id;
	}

	text(): string {
		return this._text;
	}

	sendDate(): Date {
		return this._sendDate;
	}

	isAddresser(user: User): boolean {
		return this._addresserId === user.id();
	}

	async chat(connection: Pool): Promise<Chat> {
		if (!this._chat) {
			this._chat = await Chat.get(connection, this._chatId);
		}
		return this._chat;
	}

	async addresser(connection: Pool): Promise<User> {
		if (!this._addresser) {
			this._addresser = await User.get(connection, this._addresserId);
		}
		return this._addresser;
	}

	async attachments(connection: Pool): Promise<Array<File>> {
		return buildGetRowQuery(connection, {
			table: buildLeftJoin('message_has_file', 'file', buildLeftJoinCondition('message_has_file', 'file', 'file_id')),
			condition: buildEqualCondition('message_id', this._id),
			fields: ['file_id', 'file_name', 'creating_date'],
			mapper: (result: any) => result.map(File.createFromRowData),
		})
	}

	setText(text: string): void {
		this._text = text;
	}

	async addAttachments(connection: Pool, attachmentsIds: Array<string>) {
		const addedAttachmentsIds = (await this.attachments(connection)).map(attachment => attachment.id());
		attachmentsIds = attachmentsIds.filter(id => !addedAttachmentsIds.includes(id));
		if (!attachmentsIds.length) {
			return Promise.resolve();
		}
		return buildInsertQuery(connection, 'message_has_file', attachmentsIds.map(id => ({
			'message_has_file_id': generateUUId(),
			'message_id': this._id,
			'file_id': id,
		})));
	}

	async save(connection: Pool): Promise<void> {
		if (this._wasInserted) {
			return buildSetRowQuery(connection, {
				table: 'message',
				condition: buildEqualCondition('message_id', this._id),
				values: {
					'text':  this._text,
				}
			});
		}
		return buildInsertQuery(connection, 'message', [{
			'message_id': this._id,
			'text': this._text,
			'addresser_id': this._addresserId,
			'chat_id': this._chatId,
			'send_date': this._sendDate,
		}]).then(() => {
			this._wasInserted = true;
		})
	}

	async delete(connection: Pool): Promise<void> {
		return buildDeleteRowQuery(connection, {
			table: 'message',
			condition: buildEqualCondition('message_id', this._id),
		});
	}

	static creat(text: string, addresserId: string, chatId: string): Message {
		const id = generateUUId();
		return new Message(id, text, addresserId, chatId, new Date());
	}

	static createFromRowData(rowData: any): Message {
		return new Message(
			rowData.message_id,
			rowData.text,
			rowData.addresser_id,
			rowData.chat_id,
			rowData.send_date,
			true
		);
	}

	static get(connection: Pool, id: string): Promise<Message> {
		return buildGetRowQuery(connection, {
			table: 'message',
			condition: buildEqualCondition('message_id', id),
			fields: ['message_id', 'text', 'addresser_id', 'chat_id', 'send_date'],
			mapper: (rows) => Message.createFromRowData(rows[0]),
		})
	}

	private readonly _id: string;
	private readonly _chatId: string;
	private readonly _addresserId: string;
	private readonly _sendDate: Date;
	private _text: string;
	private _addresser: User | null = null;
	private _chat: Chat | null = null;
	private _wasInserted: boolean;
}