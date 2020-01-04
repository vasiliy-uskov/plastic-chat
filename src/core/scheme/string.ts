import {checkType, joiValidatorAdapter, Validator} from "./_common";
import * as joi from "joi";

export function string(): Validator<string> {
	return (val) => checkType(val, 'string');
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