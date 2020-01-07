import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {Chat} from "../../../model/Chat";
import {send400if} from "../../../core/http/httputils";

type Props = {
	chatId: string,
	sessionId: string,
	usersIds: Array<string>,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function removeUsersFromChat({sessionId, chatId, usersIds, sessionsManager, dataBaseConnection}: Props): Promise<void> {
	const loggedUser = sessionsManager.verifiedLoggedUser(sessionId);
	const chat = await Chat.get(dataBaseConnection, chatId);
	const users = await chat.users(dataBaseConnection);
	const loggedUserHasAccessToChat = users.map(user => user.id()).includes(loggedUser.id());
	send400if(!loggedUserHasAccessToChat, 'Permission denied');
	await chat.removeUsers(dataBaseConnection, usersIds);
	const chatIsEmpty = users.filter(user => usersIds.includes(user.id())).length;
	if (chatIsEmpty) {
		await chat.delete(dataBaseConnection);
	}
}