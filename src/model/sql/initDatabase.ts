import {createPool} from "mysql";
import {readFileSync} from "fs"
import {buildQuery} from "../../core/bd/SqlBuilder";

type Config = {
	host: string,
	user: string,
	password: string,
	database: string,
}

const ModelInitializer = readFileSync('src/model/sql/model_init.sql');

export async function initDatabase(config: Config): Promise<void> {
	await buildQuery(createPool({
		host: config.host,
		user: config.user,
		password: config.password,
	}), `CREATE DATABASE IF NOT EXISTS ${config.database} DEFAULT CHARACTER SET utf8;`);
	const queries = ModelInitializer.toString().split(';');
	const pool = createPool({
		host: config.host,
		user: config.user,
		password: config.password,
		database: config.database,
	});
	for (const query of queries) {
		const queryChars = query.replace(/([\n ])/g, '');
		if (queryChars)
		{
			await buildQuery(pool, query)
		}
	}
}

export async function dropDatabase(config: Config): Promise<void> {
	return buildQuery(createPool({
		host: config.host,
		user: config.user,
		password: config.password,
	}), `DROP DATABASE IF EXISTS ${config.database};`);
}