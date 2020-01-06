import {HttpMethod} from "../http/HttpMethod";
import {Validator} from "../scheme/_common";
import {ISessionContext} from "../session/ISessionContext";
import {Pool} from "mysql";

export type Route<P, T, R> = {
	path: string,
	method: HttpMethod,
	pathVariables: Validator<P>,
	requestScheme: Validator<T>,
	responseScheme: Validator<R>,
	action: (p: P & T & {dataBaseConnection: Pool, context: ISessionContext}) => Promise<R>,
}

export type FileRout<P, T> = Route<P, T, string>;

export interface IRouter {
	addRout<P, T, R>(route: Route<P, T, R>): void;
}