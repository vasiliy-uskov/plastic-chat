import {User} from "../../model/User";
import {nullable} from "../utils/typeutils";
import {generateUUId} from "../utils/UUIDUtils";
import {ISessionManager} from "./ISessionManager";
import {verifyParameter} from "../http/httputils";

export class SessionsManager implements ISessionManager {
	init(user: User): string {
		const id = generateUUId();
		this._sessions.set(id, user);
		return id;
	}

	delete(sessionId: string): void {
		this._sessions.delete(sessionId);
	}

	loggedUser(sessionId: string): User | null {
		return nullable(this._sessions.get(sessionId));
	}

	verifiedLoggedUser(sessionId: string): User {
		return verifyParameter(this.loggedUser(sessionId), 'Incorrect sessionId');
	}

	private readonly _sessions = new Map<string, User>();
}