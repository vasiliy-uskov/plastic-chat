import {IRouter, Route} from "./IRouter";
import {Express, Request, Response} from "express-serve-static-core";
import {HttpMethod} from "../http/HttpMethod";
import {SessionsHolder} from "../session/SessionHolder";
import {HttpStatus} from "../http/HttpStatuses";
import {HttpError} from "../http/HttpError";
import {ValidationError, Validator} from "../scheme/_common";
import {Logger} from "../utils/Logger";
import {Pool} from "mysql";

export class Router implements IRouter {
	constructor(app: Express, sessionsHolder: SessionsHolder, dbConnection: Pool) {
		this._app = app;
		this._sessionsHolder = sessionsHolder;
		this._dbConnection = dbConnection;
	}

	addRout<P, T, R>(rout: Route<P, T, R>): void {
		this._initHandler(rout, this._requestJsonResolver.bind(this));
	}

	private _initHandler<P, T, R>(rout: Route<P, T, R>, handler: (rout: Route<P, T, R>, req: Request, res: Response) => void): void {
		switch (rout.method) {
			case HttpMethod.GET:
				this._app.get(rout.path, (req, res) => handler(rout, req, res));
				break;
			case HttpMethod.POST:
				this._app.post(rout.path, (req, res) => handler(rout, req, res));
				break;
		}
	}

	private async _requestJsonResolver<P, T, R>(rout: Route<P, T, R>, req: Request, res: Response): Promise<void> {
		try {
			const response = await this._executeAction(rout, req);
			res.status(HttpStatus.OK);
			res.json(response);
		}
		catch (e) {
			Router._resolveError(e, res);
		}
	}

	private async _executeAction<P, T, R>(rout: Route<P, T, R>, req: Request): Promise<R> {
		const context = this._sessionsHolder.getContext(req);
		const data = Router._parseRequestData(rout, req);
		const response = await rout.action({
			...data,
			context,
			dataBaseConnection: this._dbConnection,
		});
		return Router._validateResponse(rout.responseScheme, response);
	}

	private static _resolveError(e: Error, res: Response): void {
		if (e instanceof HttpError) {
			Router._resolveHttpError(e, res);
		}
		else {
			res.status(HttpStatus.INTERNAL_ERROR);
			Logger.error(e);
			res.send(`Oops, something go wrong`);
		}
	}

	private static _resolveHttpError(error: HttpError, res: Response): void {
		res.status(error.status);
		switch (error.status) {
			case HttpStatus.REDIRECT:
				res.redirect(error.message);
				break;
			case HttpStatus.BAD_REQUEST:
				res.send(`Bad request: ${error.message}`);
				break;
			case HttpStatus.NOT_FOUND:
				res.send(`Not found: ${error.message}`);
				break;
			case HttpStatus.INTERNAL_ERROR:
				Logger.error(error);
				res.send(`Oops, something go wrong`);
				break;
		}
		res.status(HttpStatus.BAD_REQUEST);
	}

	private static _validateResponse<R>(validator: Validator<R>, response: R): R {
		try {
			return validator(response);
		}
		catch (e) {
			Logger.error(e);
			throw new HttpError(HttpStatus.INTERNAL_ERROR);
		}
	}

	private static _parseRequestData<P, T>(validators: { pathVariables: Validator<P>, requestScheme: Validator<T> }, req: Request): P & T {
		const {pathVariables, requestScheme} = validators;
		try {
			const urlParams = pathVariables(req.params);
			const body = requestScheme(req.body);
			return {
				...urlParams,
				...body,
			};
		}
		catch (e) {
			if (e instanceof ValidationError) {
				throw new HttpError(HttpStatus.BAD_REQUEST, e.message);
			}
			Logger.error(e);
			throw new HttpError(HttpStatus.INTERNAL_ERROR);
		}
	}

	private readonly _app: Express;
	private readonly _sessionsHolder: SessionsHolder;
	private readonly _dbConnection: Pool;
}