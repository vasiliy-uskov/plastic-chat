import {File} from "../../../model/File";
import {send400if} from "../../../core/http/httputils";
import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";

type Props = {
	sessionId: string,
	file: Buffer
	fileName: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

type Out = {
	url: string,
	fileId: string,
}

const MAX_FILE_SIZE = 200 * Math.pow(2, 20); // 200MB

export async function uploadFile({file: fileData, sessionId, fileName, sessionsManager, dataBaseConnection}: Props): Promise<Out> {
	send400if(sessionsManager.loggedUser(sessionId) == null, 'Incorrect sessionId');
	send400if(fileData.length > MAX_FILE_SIZE, 'Allowed file size 200Mb. File too big');

	const file = File.creat(fileName, fileData);
	await file.save(dataBaseConnection);

	return {
		url: file.url(),
		fileId: file.id(),
	};
}