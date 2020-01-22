import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {UsersRelationship} from "../../../model/UsersRelationship";

type Props = {
	sessionId: string,
	userId: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function addFriend({sessionsManager, dataBaseConnection, sessionId, userId}: Props): Promise<void> {
	const user = sessionsManager.verifiedLoggedUser(sessionId);
	await UsersRelationship.addFriend(dataBaseConnection, user.id(), userId)
}