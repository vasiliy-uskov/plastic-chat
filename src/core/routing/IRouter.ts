import {HttpMethod} from "../http/HttpMethod";
import {Validator} from "../scheme/_common";
import {Pool} from "mysql";
import {ISessionManager} from "../session/ISessionManager";

export type Route<P, T, R> = {
	path: string,
	method: HttpMethod,
	pathVariables: Validator<P>,
	requestScheme: Validator<T>,
	responseScheme: Validator<R>,
	action: (p: P & T & {dataBaseConnection: Pool, sessionsManager: ISessionManager}) => Promise<R>,
}

export interface IRouter {
	addRout<P, T, R>(route: Route<P, T, R>): void;
}