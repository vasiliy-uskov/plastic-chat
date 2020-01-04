import {IRouter} from "../../core/routing/IRouter";
import {HttpMethod} from "../../core/routing/HttpMethod";
import {object} from "../../core/scheme/object";
import {email, guid, string} from "../../core/scheme/string";
import {any, enumerate, optional} from "../../core/scheme/raw";
import {array} from "../../core/scheme/array";

export function initializeUserRouts(router: IRouter) {
	/**
	router.addRout({
		path: 'user/:userId',
		method: HttpMethod.GET,
		pathVariables: object({
			userId: guid(),
		}),
		requestScheme: any(),
		responseScheme: object({
			name: optional(string()),
			secondName: optional(string()),
			email: email(),
			avatarUrl: optional(string()),
			gender: enumerate(['mail', 'female']),
		}),
		action: () => {},
	});

	router.addRout({
		path: 'user/register/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			name: optional(string()),
			secondName: optional(string()),
			password: string(),
			email: email(),
			gender: enumerate(['mail', 'female']),
		}),
		responseScheme: any(),
		action: () => {},
	});

	router.addRout({
		path: 'user/login/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			email: email(),
			password: string(),
		}),
		responseScheme: any(),
		action: () => {},
	});

	router.addRout({
		path: 'user/friends_list/',
		method: HttpMethod.GET,
		pathVariables: any(),
		requestScheme: any(),
		responseScheme: object({
			users: array(
				object({
					id: guid(),
					name: string(),
				})
			),
		}),
		action: () => {},
	});

	router.addRout({
		path: 'user/friends_list/remove',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			usersIds: array(guid()),
		}),
		responseScheme: object({
			removedUsersIds: array(guid()),
		}),
		action: () => {},
	});

	router.addRout({
		path: 'user/friends_list/add',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			usersIds: array(guid()),
		}),
		responseScheme: object({
			addedUsersIds: array(guid()),
		}),
		action: () => {},
	});
	*/
}