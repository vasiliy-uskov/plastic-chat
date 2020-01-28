import {Pool} from "mysql";
import {generateUUId} from "../core/utils/UUIDUtils";
import {buildGetRowQuery, buildEqualCondition, buildInsertQuery, buildSetRowQuery, buildAndCondition} from "../core/bd/SqlBuilder";
import {User} from "./User";
import {File} from "./File";
import {verify} from "../core/utils/typeutils";

export enum FileAccessRightType {
	VIEW = 0,
	EDIT = 1,
}

export class FileAccessRight {
	private constructor(id: string, accessRightType: FileAccessRightType, userId: string, fileId: string, wasInserted = false) {
		this._id = id;
		this._accessRightType = accessRightType;
		this._userId = userId;
		this._fileId = fileId;
		this._wasInserted = wasInserted;
	}

	id(): string {
		return this._id;
	}

	accessRightType(): FileAccessRightType {
		return this._accessRightType;
	}

	async user(connection: Pool): Promise<User> {
		if (!this._user) {
			this._user = verify(await User.get(connection, this._userId));
		}
		return this._user;
	}

	async file(connection: Pool): Promise<File> {
		if (!this._file) {
			this._file = await File.get(connection, this._fileId);
		}
		return this._file;
	}

	setAccessRightType(accessRightType: FileAccessRightType) {
		this._accessRightType = accessRightType;
	}

	save(connection: Pool): Promise<void> {
		if (this._wasInserted) {
			return buildSetRowQuery(connection, {
				table: 'file_access_right',
				condition: buildEqualCondition('file_access_right_id', this._id),
				values: {
					'file_access_right_type': this._accessRightType,
				}
			});
		}
		return buildInsertQuery(connection, 'file_access_right', [{
			'file_access_right_id': this._id,
			'file_access_right_type': this._accessRightType,
			'user_id': this._userId,
			'file_id': this._fileId,
		}]).then(() => {
			this._wasInserted = true;
		})
	}

	static creat(accessRight: FileAccessRightType, userId: string, fileId: string): FileAccessRight {
		const id = generateUUId();
		return new FileAccessRight(id, accessRight, userId, fileId);
	}

	static createFromRowData(rowData: any): FileAccessRight {
		return new FileAccessRight(
			rowData.file_access_right_id,
			rowData.file_access_right_type,
			rowData.user_id,
			rowData.file_id,
			true
		)
	}

	static get(connection: Pool, id: string): Promise<FileAccessRight> {
		return buildGetRowQuery(connection, {
			table: 'file_access_right',
			condition: buildEqualCondition('file_access_right_id', id),
			fields: ['file_access_right_id', 'file_access_right_type', 'user_id', 'file_id'],
			mapper: (rows) => FileAccessRight.createFromRowData(rows[0]),
		})
	}

	static getAccessType(connection: Pool, userId: string, fileId: string): Promise<FileAccessRightType> {
		return buildGetRowQuery(connection, {
			table: 'file_access_right',
			condition: buildAndCondition(
				buildEqualCondition('user_id', userId),
				buildEqualCondition('file_id', fileId)
			),
			fields: ['file_access_right_type'],
			mapper: ([row]) => (typeof row != "undefined" ? row.file_access_right_type : FileAccessRightType.VIEW),
		})
	}

	static async canEdit(connection: Pool, userId: string, fileId: string): Promise<boolean> {
		const accessType = await FileAccessRight.getAccessType(connection, userId, fileId);
		return accessType == FileAccessRightType.EDIT;
	}

	private readonly _id: string;
	private readonly _fileId: string;
	private readonly _userId: string;
	private _file: File | null = null;
	private _user: User | null = null;
	private _accessRightType: FileAccessRightType;
	private _wasInserted: boolean;
}