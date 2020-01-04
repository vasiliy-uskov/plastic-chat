export function verify(condition: any, msg?: string) {
	if (!condition) {
		throw new Error("Assertion failed " + (msg ? msg : ""));
	}
}

export function verifyArray(arr: any): Array<any> {
	verify(Array.isArray(arr), `${typeof arr} is not assignable to array`);
	return arr as Array<any>;
}

export function verifyObject(obj: any): { [key: string]: any } {
	verify(typeof obj == "object", `${typeof obj} is not assignable to object`);
	return obj as Object;
}

export function verifyNumber(numb: any): number {
	verify(typeof numb == "number", `${typeof numb} is not assignable to number`);
	return numb as number;
}

export function verifyString(str: any): string {
	verify(typeof str == "string", `${typeof str} is not assignable to string`);
	return str as string;
}