import {HttpMethod} from "../http/HttpMethod";
import {Validator} from "../scheme/_common";
import {Pool} from "mysql";
import {ISessionManager} from "../session/ISessionManager";

type Data = {dataBaseConnection: Pool, sessionsManager: ISessionManager};

export type Route<P, T, R, K=P&T> = {
	path: string,
	method: HttpMethod,
	pathVariables: Validator<P>,
	requestScheme: Validator<T>,
	responseScheme: Validator<R>,
	action: (p: K & Data) => Promise<R>,
};

export interface IRouter {
	addRout<P, T, R>(route: Route<P, T, R>): void;
}