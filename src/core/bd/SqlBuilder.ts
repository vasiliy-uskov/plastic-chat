import {Pool} from "mysql";

type Primitive = string|Date|number;

function buildQuery(pool: Pool, query: string): Promise<any> {
	return new Promise<any>((resolver, rejects) => {
		pool.query(query, (error, result) => error ? rejects(error) : resolver(result))
	});
}

function isIdField(fieldName: string): boolean {
	return !!fieldName.match(/.*_id$/);
}

function processIdValue(id: string): string {
	return `UNHEX('${id}')`;
}

function processIdFieldName(fieldName: string): string {
	return `HEX(${fieldName}) as ${fieldName}`;
}

export function processStringLiteral(str: string): string {
	return `'${str}'`;
}

function processValue(key: string, value: Primitive|null): string {
	if (isIdField(key) && value) {
		return processIdValue(value.toString());
	}
	if (value instanceof Date) {
		const year = value.getUTCFullYear();
		const month = value.getUTCMonth() + 1;
		const day = value.getUTCDay();
		const hours = value.getUTCHours();
		const minutes = value.getUTCMinutes();
		const seconds = value.getUTCSeconds();
		value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
	if (typeof value == 'string') {
		return processStringLiteral(value);
	}
	if (typeof value == 'number') {
		return value.toString();
	}
	return "NULL";
}

export function buildAlias(table: string, columnName: string): string {
	return `${table}.${columnName} as ${columnName}`;
}

export function buildFullTextSearch(fieldNames: Array<string>, values: Array<string>): string {
	const match = fieldNames.join(', ');
	const against = values
		.map(value => value.toLowerCase())
		.map(processStringLiteral)
		.join(', ');
	return `MATCH(${match}) AGAINST(${against})`;
}

export function buildEqualCondition(fieldName: string, value: Primitive|null): string {
	return `${fieldName} = ${processValue(fieldName, value)}`;
}

export function buildAndCondition(...conditions: Array<string>): string {
	return `${conditions.join(' AND ')}`;
}

export function buildOrCondition(...conditions: Array<string>): string {
	return `${conditions.join(' OR ')}`;
}

export function buildLeftJoinCondition(table1: string, table2: string, fieldName: string, secondTableFieldName?: string): string {
	return secondTableFieldName ? `ON ${table1}.${fieldName} = ${table2}.${secondTableFieldName}` : `USING(${fieldName})`;
}

export function buildLeftJoin(table1: string, table2: string, condition: string): string {
	return `${table1} LEFT JOIN ${table2} ${condition}`;
}

export function buildInsertQuery(pool: Pool, table: string, fields: Array<{[key: string]: Primitive|null}>): Promise<void> {
	if (!fields.length) {
		return Promise.resolve();
	}

	const keys = Object.keys(fields[0]);
	const values = fields.map(obj => `(${keys.map(key => processValue(key, obj[key])).join(', ')})`);
	const query = `INSERT INTO ${table} (${keys.join(',')}) VALUES ${values.join(', ')}`;
	return buildQuery(pool, query);
}

export enum SortingOrder {
	ASCEND = 'ASC',
	DESCEND = 'DESC'
}


type GetRowOptions<T> = {
	table: string,
	condition?: string,
	fields?: Array<string>,
	sort?: {
		columnName: string,
		order: SortingOrder,
	},
	offset?: number,
	limit?: number,
	mapper: (result: any) => T,
}

export function buildGetRowQuery<T>(pool: Pool, options: GetRowOptions<T>): Promise<T> {
	let fields = options.fields ? options.fields : ['*'];
	fields = fields.map(fieldName => isIdField(fieldName) ? processIdFieldName(fieldName) : fieldName);
	const condition = options.condition ? ` WHERE ${options.condition}` : '';
	const order = options.sort ? ` ORDER BY ${options.sort.columnName} ${options.sort.order}` : '';
	const limit = options.limit ? ` LIMIT ${options.limit}` : '';
	const offset = options.offset ? ` OFFSET ${options.limit}` : '';
	const query = `SELECT ${fields.join(', ')} FROM ${options.table}${condition}${order}${limit}${offset}`;
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
	values: {[key: string]: Primitive|null},
}

export function buildSetRowQuery<T>(pool: Pool, options: SetRowOptions): Promise<void> {
	const values = Object
		.keys(options.values)
		.map(key => `${key} = ${processValue(key, options.values[key])}`)
		.join(', ');
	const query = `UPDATE ${options.table} SET ${values}  WHERE ${options.condition}`;
	return buildQuery(pool, query);
}