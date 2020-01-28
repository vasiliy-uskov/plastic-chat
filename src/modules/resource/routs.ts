import {IRouter} from "../../core/routing/IRouter";
import {HttpMethod} from "../../core/http/HttpMethod";
import {object} from "../../core/scheme/object";
import {guid, notEmptyString} from "../../core/scheme/string";
import {any} from "../../core/scheme/raw";
import {base64File} from "../../core/scheme/binary";
import {uploadFile} from "./actions/uploadFile";
import {deleteFile} from "./actions/deleteFile";

export function initializeResourceRouts(router: IRouter) {
	router.addRout({
		path: '/resource/upload',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: (() => object({
			sessionId: guid(),
			fileName: notEmptyString(),
			file: base64File(),
		}))(),
		responseScheme: (() => object({
			fileId: guid(),
			url: notEmptyString(),
		}))(),
		action: uploadFile,
	});
	router.addRout({
		path: '/resource/delete',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: (() => object({
			sessionId: guid(),
			fileId: guid(),
		}))(),
		responseScheme: any(),
		action: deleteFile,
	});
}