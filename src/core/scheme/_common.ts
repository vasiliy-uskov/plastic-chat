import * as joi from "joi";

export type Validator<T> = (val: unknown) => T;

export class ValidationError extends Error {}

export function checkType<T>(val: unknown, type: string): T {
	if (typeof val !== type)
	{
		throw new ValidationError(`${val} typed as ${typeof val} is not a ${type}`);
	}
	return val as T;
}

type JoiValidator<T> = (val: T) => {error: joi.ValidationError}
type TypeChecker<T> = (val: unknown) => T

export function joiValidatorAdapter<T>(typeCheckFn: TypeChecker<T>, validator: JoiValidator<T>, message: (val: T) => string): Validator<T> {
	return (val) => {
		const str = typeCheckFn(val);
		if (validator(str).error)
		{
			throw new ValidationError(message(str));
		}
		return str as T;
	}
}