import {Pool} from "mysql";
import {User} from "../../../model/User";
import {HttpError} from "../../../core/http/HttpError";
import {HttpStatus} from "../../../core/http/HttpStatuses";
import {ISessionManager} from "../../../core/session/ISessionManager";

type Props = {
	email: string,
	password: string,
	sessionsManager: ISessionManager,
	dataBaseConnection: Pool,
}

type Out = {
	userId: string,
	sessionId: string,
}

export async function logInUser({password, email, sessionsManager, dataBaseConnection}: Props): Promise<Out> {
	const user = await User.verifyLogIn(dataBaseConnection, email, password);
	if (!user) {
		throw new HttpError(HttpStatus.BAD_REQUEST, 'Wrong email or password');
	}
	return {
		userId: user.id(),
		sessionId: sessionsManager.init(user),
	};
}