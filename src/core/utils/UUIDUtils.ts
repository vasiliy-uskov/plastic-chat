import * as uuidv4 from "uuid/v4";

export function generateUUId(): string {
	return uuidv4().toString().replace(/-/g, '');
}