import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {UsersRelationship} from "../../../model/UsersRelationship";

type Props = {
	sessionId: string,
	usersIds: Array<string>,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function addFriends({sessionsManager, dataBaseConnection, sessionId, usersIds}: Props): Promise<void> {
	const user = sessionsManager.verifiedLoggedUser(sessionId);
	await UsersRelationship.addFriends(dataBaseConnection, user.id(), usersIds)
}