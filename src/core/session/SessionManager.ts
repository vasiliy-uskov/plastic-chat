import {User} from "../../model/User";
import {nullable} from "../utils/typeutils";
import {generateUUId} from "../utils/UUIDUtils";
import {ISessionManager} from "./ISessionManager";
import {verifyParameter} from "../http/httputils";

const SESSION_LIFETIME = 1000 * 60 * 60 * 2; //2 hours

export class SessionsManager implements ISessionManager {
	init(user: User): string {
		const id = generateUUId();
		this._sessions.set(id, user);
		this._initSessionDeleteCallback(id);
		return id;
	}

	delete(sessionId: string): void {
		this._sessions.delete(sessionId);
		const clearKey = this._sessionClearKey.get(sessionId);
		if (clearKey) {
			clearTimeout(clearKey);
		}
		this._sessionClearKey.delete(sessionId)
	}

	loggedUser(sessionId: string): User | null {
		this._initSessionDeleteCallback(sessionId);
		return nullable(this._sessions.get(sessionId));
	}

	verifiedLoggedUser(sessionId: string): User {
		return verifyParameter(this.loggedUser(sessionId), 'Incorrect sessionId');
	}

	private _initSessionDeleteCallback(id: string) {
		this._sessionClearKey.set(id, setTimeout(() => this.delete(id), SESSION_LIFETIME));
	}

	private readonly _sessions = new Map<string, User>();
	private readonly _sessionClearKey = new Map<string, any>();
}