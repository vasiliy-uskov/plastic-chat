import {Pool} from "mysql";
import {buildInsertQuery, buildGetRowQuery, buildIdComparingCondition, buildSetRowQuery} from "../core/bd/SqlBuilder";
import {generateUUId} from "../core/utils/UUIDUtils";
import {User} from "./User";
import {Chat} from "./Chat";

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

	setText(text: string): void {
		this._text = text;
	}

	save(connection: Pool): Promise<void> {
		if (this._wasInserted) {
			return buildSetRowQuery(connection, {
				table: 'message',
				condition: buildIdComparingCondition('message_id', this._id),
				values: {
					'text': this._text,
				}
			});
		}
		return buildInsertQuery(connection, 'message', [{
			'message_id': `UNHEX(${this._id})`,
			'text': this._text,
			'addresser_id': this._addresserId,
			'chat_id': this._chatId,
			'send_date': this._sendDate.getTime(),
		}]).then(() => {
			this._wasInserted = true;
		})
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
			table: 'chat',
			condition: buildIdComparingCondition('chat_id', id),
			fields: ['message_id', 'text', 'addresser_id', 'chat_id', 'send_date'],
			mapper: Message.createFromRowData,
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