import {NextFunction, Request, Response, RequestHandler} from "express-serve-static-core";
import {generateUUId} from "../utils/UUIDUtils";
import {ISessionContext} from "./ISessionContext";
import {SessionContext} from "./SessionContext";

const SESSION_LIFETIME = 1000 * 60 * 60 * 2; //2 hours
const SESSION_KEY = "session_key";


export class SessionsHolder {
	sessionMiddleware(): RequestHandler {
		return this._processSession.bind(this);
	}

	getContext(req: Request): ISessionContext {
		const key = req.cookies[SESSION_KEY];
		const context = this._sessions.get(key);
		if (context) {
			return context;
		}
		throw new Error('Session was not initialized');
	}

	private _processSession(req: Request, res: Response, next: NextFunction) {
		const key = req.cookies[SESSION_KEY];
		if (!this._sessions.has(key)) {
			const key = generateUUId();
			res.cookie(SESSION_KEY, key, {
				maxAge: SESSION_LIFETIME,
				secure: true,
			});
			this._sessions.set(key, new SessionContext());
		}
		next();
	}

	private readonly _sessions = new Map<string, ISessionContext>();
}