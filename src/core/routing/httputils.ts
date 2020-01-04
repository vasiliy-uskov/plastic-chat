import {HttpError} from "./HttpError";
import {HttpStatus} from "./HttpStatuses";

export function send400if(condition: boolean, message: string): void {
	if (condition) {
		throw new HttpError(HttpStatus.BAD_REQUEST, message);
	}
}