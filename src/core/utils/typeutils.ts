export function verify(condition: any, msg?: string) {
	if (!condition) {
		throw new Error("Assertion failed " + (msg ? msg : ""));
	}
}

export function nullable<T>(item: T|undefined): T|null {
	return item === undefined ? null : item;
}