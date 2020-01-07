import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {send400if} from "../../../core/http/httputils";
import {Message} from "../../../model/Message";

type Props = {
	messageId: string,
	sessionId: string,
	text: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function editMessage({sessionId, messageId, text, sessionsManager, dataBaseConnection}: Props): Promise<void> {
	const loggedUser = sessionsManager.verifiedLoggedUser(sessionId);
	const message = await Message.get(dataBaseConnection, messageId);
	send400if(!message.isAddresser(loggedUser), 'Access denied');
	message.setText(text);
	await message.save(dataBaseConnection);
}