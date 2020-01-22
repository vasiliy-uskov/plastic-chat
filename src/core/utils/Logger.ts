import {writeFileSync} from "fs";

class Logger {
	static log(...str: Array<string>) {
		writeFileSync(Logger.INFO_FILE, `${str.join(' ')}\n`, {
			flag: 'a',
		})
	}

	static error(err: Error|string) {
		const date = new Date();
		const message = err instanceof Error ? err.stack : err;
		writeFileSync(Logger.ERRORS_FILE, `[${date}]\n${message}\n`, {
			flag: 'a',
		});
	}

	public static ERRORS_FILE = './log/errors.log';
	public static INFO_FILE = './log/info.log';
}

export {
	Logger,
}