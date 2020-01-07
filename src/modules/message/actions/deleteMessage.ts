import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {send400if} from "../../../core/http/httputils";
import {Message} from "../../../model/Message";

type Props = {
	messageId: string,
	sessionId: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function deleteMessage({sessionId, messageId, sessionsManager, dataBaseConnection}: Props): Promise<void> {
	const loggedUser = sessionsManager.verifiedLoggedUser(sessionId);
	const message = await Message.get(dataBaseConnection, messageId);
	send400if(!message.isAddresser(loggedUser), 'Access denied');
	await message.delete(dataBaseConnection);
}