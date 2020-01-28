import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {Chat} from "../../../model/Chat";
import {send400if} from "../../../core/http/httputils";
import {HttpError} from "../../../core/http/HttpError";
import {HttpStatus} from "../../../core/http/HttpStatuses";

type Props = {
	chatId: string,
	sessionId: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function deleteChat({sessionId, chatId, sessionsManager, dataBaseConnection}: Props): Promise<void> {
	const loggedUser = sessionsManager.verifiedLoggedUser(sessionId);
	const chat = await Chat.get(dataBaseConnection, chatId);
	if (!chat) {
		throw new HttpError(HttpStatus.NOT_FOUND, 'Not found');
	}
	const users = await chat.users(dataBaseConnection);
	const loggedUserHasAccessToChat = users.map(user => user.id()).includes(loggedUser.id());
	send400if(!loggedUserHasAccessToChat, 'Permission denied');
	await chat.delete(dataBaseConnection);
}