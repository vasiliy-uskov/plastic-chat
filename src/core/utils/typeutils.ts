export function nullable<T>(item: T|undefined): T|null {
	return item === undefined ? null : item;
}

export function deleteNullFields<T extends {[key: string]: any}>(obj: T): {[key in keyof T]: NonNullable<T[key]>} {
	for (const key of Object.keys(obj)) {
		if (obj[key] === null) {
			delete obj[key];
		}
	}
	return obj
}