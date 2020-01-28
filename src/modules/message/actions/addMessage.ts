import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {Chat} from "../../../model/Chat";
import {send400if} from "../../../core/http/httputils";
import {Message} from "../../../model/Message";
import {HttpError} from "../../../core/http/HttpError";
import {HttpStatus} from "../../../core/http/HttpStatuses";

type Props = {
	chatId: string,
	sessionId: string,
	attachmentsIds: Array<string>,
	text: string
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function addMessage({sessionId, chatId, text, attachmentsIds, sessionsManager, dataBaseConnection}: Props): Promise<{ messageId: string }> {
	const loggedUser = sessionsManager.verifiedLoggedUser(sessionId);
	const chat = await Chat.get(dataBaseConnection, chatId);
	if (!chat) {
		throw new HttpError(HttpStatus.NOT_FOUND, 'Chat not found')
	}
	const users = await chat.users(dataBaseConnection);
	const loggedUserHasAccessToChat = users.map(user => user.id()).includes(loggedUser.id());
	send400if(!loggedUserHasAccessToChat, 'Permission denied');
	const message = Message.creat(text, loggedUser.id(), chatId);
	await message.save(dataBaseConnection);
	await message.addAttachments(dataBaseConnection, attachmentsIds);
	return {
		messageId: message.id(),
	}
}