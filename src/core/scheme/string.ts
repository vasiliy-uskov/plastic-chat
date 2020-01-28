import {checkType, joiValidatorAdapter, ValidationError, Validator} from "./_common";
import * as joi from "joi";

export function string(): Validator<string> {
	return (val) => checkType(val, 'string');
}

export function notEmptyString(): Validator<string> {
	return (val) => {
		const str = checkType<string>(val, 'string');
		if (!str.length) {
			throw new ValidationError(`String is empty`);
		}
		return str;
	};
}

export function email(): Validator<string> {
	return joiValidatorAdapter(
		string(),
		(str) => joi.string().email().required().validate(str),
		(val) => `${val} is not email`
	)
}

export function guid(): Validator<string> {
	return joiValidatorAdapter(
		string(),
		(str) => joi.string().guid().required().validate(str),
		(val) => `${val} is not a guid`
	)
}