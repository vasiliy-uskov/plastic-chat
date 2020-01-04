import {Pool} from "mysql";

export function buildQuery(pool: Pool, query: string): Promise<any> {
	return new Promise<any>((resolver, rejects) => {
		pool.query(query, (error, result) => error ? rejects(error) : resolver(result))
	});
}

export function buildInsertQuery(pool: Pool, table: string, fields: Array<{[key: string]: string|number|null}>): Promise<void> {
	if (!fields.length) {
		return Promise.resolve();
	}
	const keys = Object.keys(fields[0]);
	const values = fields.map(obj => `(${keys.map(key => obj[key]).join(',')})`);
	const query = `INSERT INTO ${table} (${keys.join(',')}) SET ${values.join(',')}`;
	return buildQuery(pool, query);
}

type GetRowOptions<T> = {
	table: string,
	condition: string,
	fields?: Array<string>,
	mapper: (result: any) => T,
}

export function buildIdComparingCondition(fieldName: string, id: string) {
	return `${fieldName} = UNHEX(${id})`;
}

export function buildAndCondition(...conditions: Array<string>) {
	return `${conditions.join(' AND ')}`;
}

export function buildLeftJoin(table1: string, table2: string, fieldName: string) {
	return `${table1} LEFT JOIN ${table2} ON USING(${fieldName})`;
}

export function buildGetRowQuery<T>(pool: Pool, options: GetRowOptions<T>): Promise<T> {
	const fields = options.fields ? options.fields.join(',') : '*';
	const query = `SELECT ${fields} FROM ${options.table} WHERE ${options.condition}`;
	return buildQuery(pool, query).then(options.mapper);
}


type CountRowOptions = {
	table: string,
	condition: string,
	groupingField: string,
}

export function buildCountRowQuery(pool: Pool, options: CountRowOptions): Promise<number> {
	const query = `SELECT COUNT(*) FROM ${options.table} WHERE ${options.condition} GROUP BY ${options.groupingField}`;
	return buildQuery(pool, query);
}

type DeleteRowOptions = {
	table: string,
	condition: string,
}

export function buildDeleteRowQuery(pool: Pool, options: DeleteRowOptions): Promise<void> {
	const query = `DELETE FROM ${options.table} WHERE ${options.condition}`;
	return buildQuery(pool, query);
}

type SetRowOptions = {
	table: string,
	condition: string,
	values: {[key: string]: string|number|null},
}

export function buildSetRowQuery<T>(pool: Pool, options: SetRowOptions): Promise<void> {
	const values = Object
		.keys(options.values)
		.map(key => `${key} = ${options.values[key]}`)
		.join(',');
	const query = `UPDATE ${options.condition} SET ${values}  WHERE ${options.condition}`;
	return buildQuery(pool, query);
}