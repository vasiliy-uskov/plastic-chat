import {checkType, ValidationError, Validator} from "./_common";

export function checkNaN(val: number): number {
	if (isNaN(val))
	{
		throw new ValidationError(`val is NaN`);
	}
	return val;
}

export function number(): Validator<number> {
	return (val) => checkNaN(+checkType<number>(val, 'number'));
}