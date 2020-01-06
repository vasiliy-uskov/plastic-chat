import {NextFunction, Request, RequestHandler, Response} from "express-serve-static-core";
import {generateUUId} from "../utils/UUIDUtils";
import {ISessionContext} from "./ISessionContext";
import {SessionContext} from "./SessionContext";
import {HttpError} from "../http/HttpError";
import {HttpStatus} from "../http/HttpStatuses";

const SESSION_LIFETIME = 1000 * 60 * 60 * 2; //2 hours
const SESSION_KEY = "session_key";


export class SessionsHolder {
	sessionMiddleware(): RequestHandler {
		return this._processSession.bind(this);
	}

	getContext(req: Request): ISessionContext {
		const cookies = req.cookies || {};
		const key = cookies[SESSION_KEY];
		const context = this._sessions.get(key);
		if (context) {
			return context;
		}
		throw new HttpError(HttpStatus.BAD_REQUEST, 'Session was not initialized');
	}

	private _processSession(req: Request, res: Response, next: NextFunction) {
		req.cookies = req.cookies || {};
		const key = req.cookies[SESSION_KEY];
		if (!this._sessions.has(key)) {
			const key = generateUUId();
			res.cookie(SESSION_KEY, key, {
				maxAge: SESSION_LIFETIME,
				secure: true,
			});
			req.cookies[SESSION_KEY] = key;
			this._sessions.set(key, new SessionContext());
		}
		next();
	}

	private readonly _sessions = new Map<string, ISessionContext>();
}