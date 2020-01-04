import {checkType, Validator} from "./_common";

export function base64File(): Validator<Buffer> {
	return val => {
		const encodedFile = checkType<string>(val, 'string');
		return Buffer.from(encodedFile, 'base64');
	}
}