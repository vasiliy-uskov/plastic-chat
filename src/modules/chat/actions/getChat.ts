import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {Chat} from "../../../model/Chat";
import {send400if} from "../../../core/http/httputils";
import {genderToString} from "../../../model/User";
import {deleteNullFields} from "../../../core/utils/typeutils";

type Props = {
	chatId: string,
	sessionId: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

type Out = {
	name: string,
	users: Array<{
		firstName?: string,
		lastName?: string,
		email: string,
		gender: ('male' | 'female'),
	}>,
};

export async function getChat({sessionId, chatId, sessionsManager, dataBaseConnection}: Props): Promise<Out> {
	const loggedUser = sessionsManager.verifiedLoggedUser(sessionId);
	const chat = await Chat.get(dataBaseConnection, chatId);
	const users = await chat.users(dataBaseConnection);
	const loggedUserHasAccessToChat = users.map(user => user.id()).includes(loggedUser.id());
	send400if(!loggedUserHasAccessToChat, 'Permission denied');
	return {
		name: chat.name(),
		users: users.map(user => deleteNullFields({
			firstName: user.firstName(),
			lastName: user.lastName(),
			email: user.email(),
			gender: genderToString(user.gender()),
		}))
	};
}