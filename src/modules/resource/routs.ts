import {IRouter} from "../../core/routing/IRouter";
import {HttpMethod} from "../../core/routing/HttpMethod";
import {object} from "../../core/scheme/object";
import {string} from "../../core/scheme/string";
import {any} from "../../core/scheme/raw";
import {base64File} from "../../core/scheme/binary";
import {uploadFile} from "./actions/uploadFile";

export function initializeResourceRouts(router: IRouter) {
	router.addRout({
		path: '/resource/upload',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			fileName: string(),
			file: base64File(),
		}),
		responseScheme: object({
			fileId: string(),
			url: string(),
		}),
		action: uploadFile,
	});
}