import {ValidationError, Validator} from "./_common";

export function raw<T>(value: T): Validator<T> {
	return val => {
		if (val !== value)
		{
			throw new ValidationError(`${val} is not ${value}`);
		}
		return val as T;
	}
}

export function any(): Validator<unknown> {
	return val => val as unknown;
}

export function enumerate<T>(values: Array<T>): Validator<T> {
	return val => {
		if (!values.includes(val as T))
		{
			throw new ValidationError(`${val} is not one of <${values.join(', ')}>`);
		}
		return val as T;
	}
}

export function alternative<T, R, E, K>(validators: Array<Validator<T>|Validator<R>|Validator<E>|Validator<K>>): Validator<T|R|E|K> {
	return val => {
		const errors: Array<string> = [];
		for (const validator of validators)
		{
			try {
				return validator(val);
			}
			catch (e) {
				if (e instanceof ValidationError)
				{
					errors.push(e.message);
				}
				else {
					throw e;
				}
			}
		}
		if (errors.length) {
			throw new ValidationError(errors.join(', '));
		}
		return val as T|R|E|K;
	}
}

export function optional<T>(validator: Validator<T>): Validator<T|undefined> {
	return alternative([validator, raw(undefined)]);
}