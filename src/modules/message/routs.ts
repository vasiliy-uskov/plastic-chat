import {IRouter} from "../../core/routing/IRouter";
import {HttpMethod} from "../../core/http/HttpMethod";
import {object} from "../../core/scheme/object";
import {email, guid, notEmptyString} from "../../core/scheme/string";
import {number} from "../../core/scheme/number";
import {array} from "../../core/scheme/array";
import {any, enumerate, optional} from "../../core/scheme/raw";
import {Gender, genderToString} from "../../model/User";
import {getMessages} from "./actions/getMessages";
import {addMessage} from "./actions/addMessage";
import {deleteMessage} from "./actions/deleteMessage";
import {editMessage} from "./actions/editMessage";

export function initializeMessageRouts(router: IRouter) {
	router.addRout({
		path: '/messages/:chatId',
		method: HttpMethod.GET,
		pathVariables: (() => object({
			chatId: guid(),
		}))(),
		requestScheme: (() => object({
			sessionId: guid(),
			page: number(),
			pageMessagesCount: number(),
		}))(),
		responseScheme: (() => object({
			messages: array(object({
				messageId: guid(),
				text: notEmptyString(),
				sendDate: number(),
				attachments: array(object({
					fileId: guid(),
					url: notEmptyString(),
				})),
				addresser: object({
					id: guid(),
					firstName: optional(notEmptyString()),
					lastName: optional(notEmptyString()),
					email: email(),
					avatarUrl: optional(notEmptyString()),
					gender: enumerate([
						genderToString(Gender.MALE),
						genderToString(Gender.FEMALE)
					]),
				}),
			})),
		}))(),
		action: getMessages,
	});

	router.addRout({
		path: '/message/add/:chatId',
		method: HttpMethod.POST,
		pathVariables: (() => object({
			chatId: guid(),
		}))(),
		requestScheme: (() => object({
			sessionId: guid(),
			text: notEmptyString(),
			attachmentsIds: array(guid()),
		}))(),
		responseScheme: object({
			messageId: guid(),
		}),
		action: addMessage,
	});

	router.addRout({
		path: '/message/delete/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: (() => object({
			sessionId: guid(),
			messageId: guid(),
		}))(),
		responseScheme: any(),
		action: deleteMessage,
	});

	router.addRout({
		path: '/message/edit/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: (() => object({
			sessionId: guid(),
			messageId: guid(),
			text: notEmptyString(),
		}))(),
		responseScheme: any(),
		action: editMessage,
	});
}