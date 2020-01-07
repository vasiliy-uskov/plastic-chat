import {IRouter} from "../../core/routing/IRouter";
import {HttpMethod} from "../../core/http/HttpMethod";
import {object} from "../../core/scheme/object";
import {email, guid, string} from "../../core/scheme/string";
import {any, enumerate, optional} from "../../core/scheme/raw";
import {Gender, genderToString} from "../../model/User";
import {getUser} from "./actions/getUser";
import {registerUser} from "./actions/registerUser";
import {logInUser} from "./actions/logInUser";
import {logOutUser} from "./actions/logOutUser";
import {editUser} from "./actions/editUser";
export function initializeUserRouts(router: IRouter) {
	router.addRout({
		path: '/user/:userId',
		method: HttpMethod.GET,
		pathVariables: object({
			userId: guid(),
		}),
		requestScheme: any(),
		responseScheme: object({
			firstName: optional(string()),
			lastName: optional(string()),
			email: email(),
			avatarUrl: optional(string()),
			gender: enumerate([
				genderToString(Gender.MALE),
				genderToString(Gender.FEMALE)
			]),
		}),
		action: getUser,
	});

	router.addRout({
		path: '/user/register/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			firstName: optional(string()),
			lastName: optional(string()),
			password: string(),
			email: email(),
			gender: enumerate([
				genderToString(Gender.MALE),
				genderToString(Gender.FEMALE)
			]),
		}),
		responseScheme: object({
			userId: guid(),
		}),
		action: registerUser,
	});

	router.addRout({
		path: '/user/edit/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			firstName: optional(string()),
			lastName: optional(string()),
			password: optional(string()),
			avatarId: optional(string()),
		}),
		responseScheme: any(),
		action: editUser,
	});

	router.addRout({
		path: '/user/login/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			email: email(),
			password: string(),
		}),
		responseScheme: object({
			userId: guid(),
			sessionId: guid(),
		}),
		action: logInUser,
	});

	router.addRout({
		path: '/user/logout/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
		}),
		responseScheme: any(),
		action: logOutUser,
	});

	/**
	router.addRout({
		path: '/user/friends_list/',
		method: HttpMethod.GET,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
		}),
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

	/**
	router.addRout({
		path: '/user/friends_list/remove',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			usersIds: array(guid()),
		}),
		responseScheme: object({
			removedUsersIds: array(guid()),
		}),
		action: () => {},
	});

	router.addRout({
		path: '/user/friends_list/add',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			sessionId: guid(),
			usersIds: array(guid()),
		}),
		responseScheme: object({
			addedUsersIds: array(guid()),
		}),
		action: () => {},
	});
	*/
}