import {IRouter} from "../../core/routing/IRouter";
import {HttpMethod} from "../../core/http/HttpMethod";
import {email, guid, string} from "../../core/scheme/string";
import {object} from "../../core/scheme/object";
import {any, enumerate, optional} from "../../core/scheme/raw";
import {array} from "../../core/scheme/array";
import {Gender, genderToString} from "../../model/User";
import {getChat} from "./actions/getChat";
import {addChat} from "./actions/addFile";
import {deleteChat} from "./actions/deleteChat";
import {editChat} from "./actions/editChat";
import {addUsersToChat} from "./actions/addUsersToChat";
import {removeUsersFromChat} from "./actions/removeUsersFromChat";

export function initializeChatRouts(router: IRouter) {
	router.addRout({
		path: '/chat/:chatId',
		method: HttpMethod.GET,
		pathVariables: object({
			chatId: guid(),
		}),
		requestScheme: object({
			sessionId: guid(),
		}),
		responseScheme: object({
			name: string(),
			users: array(object({
				firstName: optional(string()),
				lastName: optional(string()),
				email: email(),
				gender: enumerate([
					genderToString(Gender.MALE),
					genderToString(Gender.FEMALE)
				]),
			})),
		}),
		action: getChat,
	});

	router.addRout({
		path: '/chat/add',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			name: string(),
		}),
		responseScheme: object({
			chatId: guid(),
		}),
		action: addChat,
	});

	router.addRout({
		path: '/chat/delete',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			chatId: guid(),
		}),
		responseScheme: any(),
		action: deleteChat,
	});

	router.addRout({
		path: '/chat/edit',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			chatId: guid(),
			name: string(),
		}),
		responseScheme: any(),
		action: editChat,
	});

	router.addRout({
		path: '/chat/add/users',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			chatId: guid(),
			usersIds: array(guid()),
		}),
		responseScheme: any(),
		action: addUsersToChat,
	});

	router.addRout({
		path: '/chat/remove/users',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			chatId: guid(),
			usersIds: array(guid()),
		}),
		responseScheme: any(),
		action: removeUsersFromChat,
	});
}