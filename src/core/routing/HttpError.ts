import {HttpStatus} from "./HttpStatuses";

export class HttpError extends Error {
	constructor(status: HttpStatus, message: string = '') {
		super(message);
		this.status = status
	}

	public readonly status: HttpStatus;
}