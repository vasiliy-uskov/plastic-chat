import {File} from "../../../model/File";
import {send400if} from "../../../core/http/httputils";
import {Pool} from "mysql";
import {ISessionContext} from "../../../core/session/ISessionContext";

type Props = {
	file: Buffer
	fileName: string,
	dataBaseConnection: Pool,
	context: ISessionContext,
}

const MAX_FILE_SIZE = 200 * Math.pow(2, 20); // 200MB

export async function uploadFile({file: fileData, fileName, context, dataBaseConnection}: Props): Promise<{ url: string }> {
	send400if(context.loggedUser() == null, 'User must be initialized');
	send400if(fileData.length > MAX_FILE_SIZE, 'Allowed file size 200Mb. File too big');

	const file = File.creat(fileName, fileData);
	await file.save(dataBaseConnection);

	return { url: file.url() };
}