import {File} from "../../../model/File";
import {send400if, verifyParameter} from "../../../core/http/httputils";
import {Pool} from "mysql";
import {ISessionManager} from "../../../core/session/ISessionManager";
import {FileAccessRight} from "../../../model/FileAccessRight";

type Props = {
	sessionId: string,
	fileId: string,
	dataBaseConnection: Pool,
	sessionsManager: ISessionManager,
}

export async function deleteFile({sessionId, fileId, sessionsManager, dataBaseConnection}: Props): Promise<void> {
	const user = verifyParameter(sessionsManager.loggedUser(sessionId), 'Incorrect sessionId');

	const canEdit = await FileAccessRight.canEdit(dataBaseConnection, user.id(), fileId);
	send400if(!canEdit, 'Permission denied');
	const file = await File.get(dataBaseConnection, fileId);
	await file.delete(dataBaseConnection);
}