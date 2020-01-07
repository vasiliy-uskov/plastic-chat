import {HttpError} from "./HttpError";
import {HttpStatus} from "./HttpStatuses";

export function send400if(condition: boolean, message: string): void {
	if (condition) {
		throw new HttpError(HttpStatus.BAD_REQUEST, message);
	}
}

export function verifyParameter<T>(parametr: T|null, message: string): T {
	if (parametr == null) {
		throw new HttpError(HttpStatus.BAD_REQUEST, message);
	}
	return parametr
}