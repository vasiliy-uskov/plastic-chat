import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {Chat} from "../../../model/Chat";
import {send400if} from "../../../core/http/httputils";
import {genderToString} from "../../../model/User";
import {deleteNullFields} from "../../../core/utils/typeutils";
import {HttpError} from "../../../core/http/HttpError";
import {HttpStatus} from "../../../core/http/HttpStatuses";

type Props = {
	chatId: string,
	sessionId: string,
	page: number,
	pageMessagesCount: number,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

type Out = {
	messages: Array<{
		messageId: string,
		text: string,
		sendDate: number,
		addresser: {
			id: string,
			firstName?: string,
			lastName?: string,
			avatarUrl?: string,
			email: string,
			gender: ('male'|'female'),
		}
	}>
}

export async function getMessages({sessionId, chatId, pageMessagesCount, page, sessionsManager, dataBaseConnection}: Props): Promise<Out> {
	const loggedUser = sessionsManager.verifiedLoggedUser(sessionId);
	const chat = await Chat.get(dataBaseConnection, chatId);
	if (!chat) {
		throw new HttpError(HttpStatus.NOT_FOUND, 'Chat not found')
	}
	const users = await chat.users(dataBaseConnection);
	const loggedUserHasAccessToChat = users.map(user => user.id()).includes(loggedUser.id());
	send400if(!loggedUserHasAccessToChat, 'Permission denied');

	const messages = await chat.messages(dataBaseConnection, page, pageMessagesCount);
	const messagesData = await Promise.all(messages.map(async ({message, addresser, avatar}) => ({
		messageId: message.id(),
		text: message.text(),
		sendDate: message.sendDate().getTime(),
		attachments: (await message.attachments(dataBaseConnection)).map(file => ({
			fileId: file.id(),
			url: file.url(),
		})),
		addresser: deleteNullFields({
			id: addresser.id(),
			firstName: addresser.firstName(),
			lastName: addresser.lastName(),
			avatarUrl: avatar && avatar.url(),
			email: addresser.email(),
			gender: genderToString(addresser.gender()),
		})
	})));
	return {
		messages: messagesData,
	}
}