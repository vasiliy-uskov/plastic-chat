import {checkExtends, ValidationError, Validator} from "./_common";

export function array<T>(validator: Validator<T>): Validator<Array<T>> {
	return (val) => {
		const typedVal = checkExtends<Array<unknown>>(val, Array);
		const errors = new Array<string>();
		for (const value of typedVal)
		{
			try {
				validator(value);
			}
			catch (e) {
				if (e instanceof ValidationError) {
					errors.push(e.message);
				}
				else {
					throw e;
				}
			}
		}
		if (errors.length)
		{
			throw new ValidationError(`Array props validation error:\n\t${errors.join('\n\t')}\n`);
		}
		return val as Array<T>;
	}
}