import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {UsersRelationship, UsersRelationshipType} from "../../../model/UsersRelationship";
import {deleteNullFields} from "../../../core/utils/typeutils";
import {genderToString} from "../../../model/User";

type Props = {
	sessionId: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

type Out = {
	users: Array<{
		id: string,
		firstName?: string,
		lastName?: string,
		email: string,
		gender: ('male'|'female'),
	}>
}

export async function getFriendsList({sessionsManager, dataBaseConnection, sessionId}: Props): Promise<Out> {
	const user = sessionsManager.verifiedLoggedUser(sessionId);
	const friends = await UsersRelationship.getList(dataBaseConnection, user.id(), UsersRelationshipType.FRIEND);
	return {
		users: friends.map(user => deleteNullFields({
			id: user.id(),
			firstName: user.firstName(),
			lastName: user.lastName(),
			email: user.email(),
			gender: genderToString(user.gender()),
		})),
	}
}