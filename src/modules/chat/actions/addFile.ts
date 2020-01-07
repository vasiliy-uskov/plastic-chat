import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {Chat} from "../../../model/Chat";

type Props = {
	name: string,
	sessionId: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

type Out = {
	chatId: string,
};

export async function addChat({sessionId, name, sessionsManager, dataBaseConnection}: Props): Promise<Out> {
	const loggedUser = sessionsManager.verifiedLoggedUser(sessionId);
	const chat = Chat.creat(name);
	await chat.save(dataBaseConnection);
	await chat.addUsers(dataBaseConnection, [loggedUser.id()]);
	return {
		chatId: chat.id(),
	};
}