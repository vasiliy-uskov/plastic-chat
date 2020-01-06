import {IRouter} from "../../core/routing/IRouter";
import {HttpMethod} from "../../core/http/HttpMethod";
import {object} from "../../core/scheme/object";
import {email, guid, string} from "../../core/scheme/string";
import {any, enumerate, optional} from "../../core/scheme/raw";
import {Gender, genderToString} from "../../model/User";
import {getUser} from "./actions/getUser";
import {registerUser} from "./actions/registerUser";
import {logInUser} from "./actions/logInUser";

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
			userId: string(),
		}),
		action: registerUser,
	});

	router.addRout({
		path: '/user/login/',
		method: HttpMethod.POST,
		pathVariables: any(),
		requestScheme: object({
			email: email(),
			password: string(),
		}),
		responseScheme: any(),
		action: logInUser,
	});

	/**
	router.addRout({
		path: '/user/friends_list/',
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
		path: '/user/friends_list/remove',
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
		path: '/user/friends_list/add',
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