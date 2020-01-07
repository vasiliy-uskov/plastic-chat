import {IRouter} from "../../core/routing/IRouter";
import {HttpMethod} from "../../core/http/HttpMethod";
import {email, guid, string} from "../../core/scheme/string";
import {object} from "../../core/scheme/object";
import {any, enumerate, optional} from "../../core/scheme/raw";
import {array} from "../../core/scheme/array";
import {Gender, genderToString} from "../../model/User";
import {number} from "../../core/scheme/number";
import {getMessages} from "./actions/getMessages";
import {addMessage} from "./actions/addMessage";
import {deleteMessage} from "./actions/deleteMessage";
import {editMessage} from "./actions/editMessage";

export function initializeMessageRouts(router: IRouter) {
	router.addRout({
		path: '/messages/:chatId',
		method: HttpMethod.GET,
		pathVariables: object({
			chatId: guid(),
		}),
		requestScheme: object({
			sessionId: guid(),
			page: number(),
			pageMessagesCount: number(),
		}),
		responseScheme: object({
			messages: array(object({
				messageId: guid(),
				text: string(),
				sendDate: number(),
				attachments: array(object({
					fileId: guid(),
					url: string(),
				})),
				addresser: object({
					firstName: optional(string()),
					lastName: optional(string()),
					email: email(),
					avatarUrl: optional(string()),
					gender: enumerate([
						genderToString(Gender.MALE),
						genderToString(Gender.FEMALE)
					]),
				}),
			})),
		}),
		action: getMessages,
	});

	router.addRout({
		path: '/message/add/:chatId',
		method: HttpMethod.POST,
		pathVariables: object({
			chatId: guid(),
		}),
		requestScheme: object({
			sessionId: guid(),
			text: string(),
			attachmentsIds: array(guid()),
		}),
		responseScheme: object({
			messageId: guid(),
		}),
		action: addMessage,
	});
	router.addRout({
		path: '/message/delete/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			messageId: guid(),
		}),
		responseScheme: any(),
		action: deleteMessage,
	});
	router.addRout({
		path: '/message/edit/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			messageId: guid(),
			text: string(),
		}),
		responseScheme: any(),
		action: editMessage,
	});
}