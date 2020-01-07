import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {verifyParameter} from "../../../core/http/httputils";
import {File} from "../../../model/File";

type Props = {
	sessionId: string,
	firstName?: string,
	lastName?: string,
	password?: string,
	avatarId?: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function editUser({sessionsManager, dataBaseConnection, sessionId, ...userData}: Props): Promise<void> {
	const user = verifyParameter(sessionsManager.loggedUser(sessionId), 'Incorrect sessionId');
	if (userData.firstName) {
		user.setFirstName(userData.firstName);
	}
	if (userData.lastName) {
		user.setLastName(userData.lastName);
	}
	if (userData.password) {
		user.setPassword(userData.password);
	}
	if (userData.avatarId) {
		const avatar = await File.get(dataBaseConnection, userData.avatarId);
		user.setAvatar(avatar);
	}
	await user.save(dataBaseConnection);
}