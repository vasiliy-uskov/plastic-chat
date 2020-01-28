export function nullable<T>(item: T|undefined): T|null {
	return item === undefined ? null : item;
}

type NullToUndefined<T> = {[key in keyof T]: T[key] extends null ? undefined : NonNullable<T[key]>};

export function deleteNullFields<T>(obj: T): NullToUndefined<T> {
	for (const key of Object.keys(obj)) {
		if (obj[key as keyof T] === null) {
			delete obj[key as keyof T];
		}
	}
	return obj as NullToUndefined<T>
}

export function verify<T>(val: T): NonNullable<T> {
	if (val == null) {
		throw new Error('Assert');
	}
	return val as NonNullable<T>;
}