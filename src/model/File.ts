import {Pool} from "mysql";
import {writeFileSync} from "fs";
import {basename, join} from "path";
import {buildInsertQuery, buildGetRowQuery, buildIdComparingCondition} from "../core/bd/SqlBuilder";
import {generateUUId} from "../core/utils/UUIDUtils";

export class File {
	static readonly LOCAL_FILE_STORAGE = './upload';
	static readonly SERVICE_FILE_STORAGE = '/resource';

	private constructor(id: string, path: string, creatingDate: Date, wasInserted = false) {
		this._id = id;
		this._name = path;
		this._creatingDate = creatingDate;
		this._wasInserted = wasInserted;
	}

	id(): string {
		return this._id;
	}

	name(): string {
		return this._name;
	}

	creatingDate(): Date {
		return this._creatingDate;
	}

	save(connection: Pool): Promise<void> {
		if (this._wasInserted) {
			return Promise.resolve();
		}
		return buildInsertQuery(connection, 'file', [{
			'file_id': `UNHEX(${this._id})`,
			'file_name': this._name,
			'creating_date': this._creatingDate.getTime(),
		}]).then(() => {
			this._wasInserted = true;
		})
	}

	static creat(fileName: string, file: Buffer): File {
		const id = generateUUId();
		const storeFileName = id + basename(fileName);
		writeFileSync(join(File.LOCAL_FILE_STORAGE, storeFileName), file);
		return new File(id, storeFileName, new Date());
	}

	static createFromRowData(rowData: any): File {
		return new File(rowData.file_id, rowData.file_name, new Date(rowData.creating_date), true)
	}

	static get(connection: Pool, id: string): Promise<File> {
		return buildGetRowQuery(connection, {
			table: 'file',
			condition: buildIdComparingCondition('file_id', id),
			fields: ['file_id', 'file_name', 'creating_date'],
			mapper: File.createFromRowData,
		})
	}

	private readonly _id: string;
	private readonly _name: string;
	private readonly _creatingDate: Date;
	private _wasInserted: boolean;
}