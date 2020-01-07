import {ISessionManager} from "../../../core/session/ISessionManager";

type Props = {
	sessionId: string,
	sessionsManager: ISessionManager,
}

export async function logOutUser({sessionId, sessionsManager}: Props): Promise<void> {
	sessionsManager.delete(sessionId);
}