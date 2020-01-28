import {Pool, escape} from "mysql";

type Primitive = string|Date|number;

export function buildQuery(pool: Pool, query: string): Promise<any> {
	return new Promise<any>((resolver, rejects) => {
		pool.query(query, (error, result) => {
			error ? rejects(error) : resolver(result)
		})
	});
}

function isIdField(fieldName: string): boolean {
	return !!fieldName.match(/.*_id$/);
}

export function processStringLiteral(str: string): string {
	return `${escape(str)}`;
}

function processIdValue(id: string): string {
	return `UNHEX(${processStringLiteral(id)})`;
}

function processIdFieldName(fieldName: string): string {
	return `LOWER(HEX(${fieldName})) as ${fieldName}`;
}

function formatNumber(num: number, minDigitsCount: number) {
	const numberString = num.toString();
	const zeroDigitsPrefixCount = Math.max(0, minDigitsCount - numberString.length);
	const zeroDigitsPrefix = Array(zeroDigitsPrefixCount).fill(0).join('');
	return zeroDigitsPrefix + numberString;
}

function processValue(key: string, value: Primitive|null): string {
	if (isIdField(key) && value) {
		return processIdValue(value.toString());
	}
	if (value instanceof Date) {
		const year = formatNumber(value.getUTCFullYear(), 4);
		const month = formatNumber(value.getUTCMonth() + 1, 2);
		const day = formatNumber(value.getUTCDate(), 2);
		const hours = formatNumber(value.getUTCHours(), 2);
		const minutes = formatNumber(value.getUTCMinutes(), 2);
		const seconds = formatNumber(value.getUTCSeconds(), 2);
		return processStringLiteral(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
	}
	if (typeof value == 'string') {
		return processStringLiteral(value);
	}
	if (typeof value == 'number') {
		return value.toString();
	}
	return "NULL";
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
	return `${conditions.map(condition => `(${condition})`).join(' AND ')}`;
}

export function buildOrCondition(...conditions: Array<string>): string {
	return `${conditions.map(condition => `(${condition})`).join(' OR ')}`;
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
	mapper: (result: Array<any>) => T,
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