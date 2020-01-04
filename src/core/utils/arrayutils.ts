export function flat<T>(arr: Array<Array<T>>): Array<T> {
	return arr.reduce((a, b) => [...a, ...b], []);
}