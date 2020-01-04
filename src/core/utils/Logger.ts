import {writeFileSync} from "fs";

export class Logger {
	static log(str: string) {
		writeFileSync(Logger.INFO_FILE, str + '\n', {
			mode: 'a',
		})
	}

	static error(err: Error|string) {
		const data = (err instanceof Error ? err.message : err) + '\n';
		writeFileSync(Logger.ERRORS_FILE, data, {
			mode: 'a',
		})
	}

	private static ERRORS_FILE = './log/errors.log';
	private static INFO_FILE = './log/info.log';
}