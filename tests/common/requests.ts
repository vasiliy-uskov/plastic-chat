import * as request from "request";
import {HttpMethod} from "../../src/core/http/HttpMethod";
import {TestServerConfig} from "../../src/configs/TestServerConfig";

const uri = "127.0.0.1";

function makeRequest<T extends {}>(method: HttpMethod, address: string, body: T): Promise<any> {
	return new Promise(((resolver, reject) => {
		const url = `http://${uri}:${TestServerConfig.port}${address}`;
		const config = {
			method,
			body,
			jre: true,
			json: true,
		};
		request(url, config, (error, respones, body) => {
			if (error) {
				reject(error)
			}
			if (respones && respones.statusCode && respones.statusCode != 200) {
				reject(body)
			}
			resolver(body)
		})
	}))
}

type RegisterProps = {
	firstName: string,
	lastName: string,
	email: string,
	password: string,
	gender: string,
}

type EditProps = {
	sessionId: string,
	firstName?: string,
	lastName?: string,
	password?: string,
	avatarId?: string
}

type LoginProps = {
	email: string,
	password: string,
}

type EditFriendListProps = {
	sessionId: string,
	userId: string
}

const User = {
	register: (props: RegisterProps) => makeRequest(HttpMethod.POST, '/user/register', props),
	get: (userId: string) => makeRequest(HttpMethod.GET, `/user/${userId}`, {}),
	edit: (props: EditProps) => makeRequest(HttpMethod.POST, `/user/edit`, props),
	login: (props: LoginProps) => makeRequest(HttpMethod.POST, `/user/login`, props),
	logout: (sessionId: string) => makeRequest(HttpMethod.POST, `/user/logout`, {sessionId}),
	find: (search: string) => makeRequest(HttpMethod.GET, `/user/find/?search=${search}`, {}),
	friendsList: (sessionId: string) => makeRequest(HttpMethod.GET, `/user/friends_list/`, {sessionId}),
	removeFriend: (props: EditFriendListProps) => makeRequest(HttpMethod.POST, `/user/friends_list/remove`, props),
	addFriend: (props: EditFriendListProps) => makeRequest(HttpMethod.POST, `/user/friends_list/add`, props),
};

type UploadResourceProps = {
	sessionId: string,
	fileName: string,
	file: Buffer,
}

type DeleteResourceProps = {
	sessionId: string,
	fileId: string,
}

const Resource = {
	upload: (props: UploadResourceProps) => makeRequest(HttpMethod.POST, `/resource/upload`, {
		...props,
		file: props.file.toString('base64'),
	}),
	get: (url: string) => new Promise((resolve, reject) => {
		request.get(
			`http://${uri}:${TestServerConfig.port}${url}`,
			(error, response, data) => error ? reject(error) : resolve(data)
		)
	}),
	delete: (props: DeleteResourceProps) => makeRequest(HttpMethod.POST, `/resource/delete`, props)
};

type GetChatProps = {
	sessionId: string,
	chatId: string,
}

type AddChatProps = {
	sessionId: string,
	name: string,
}

type DeleteChatProps = {
	sessionId: string,
	chatId: string,
}

type EditChatProps = {
	sessionId: string,
	chatId: string,
	name: string,
}

type EditUsersTOChatProps = {
	sessionId: string,
	chatId: string,
	usersIds: Array<string>,
}

const Chat = {
	get: ({sessionId, chatId}: GetChatProps) => makeRequest(HttpMethod.GET, `/chat/${chatId}`, {sessionId}),
	add: (props: AddChatProps) => makeRequest(HttpMethod.POST, `/chat/add`, props),
	delete: (props: DeleteChatProps) => makeRequest(HttpMethod.POST, `/chat/delete`, props),
	edit: (props: EditChatProps) => makeRequest(HttpMethod.POST, `/chat/edit`, props),
	addUsers: (props: EditUsersTOChatProps) => makeRequest(HttpMethod.POST, `/chat/users/add`, props),
	removeUsers: (props: EditUsersTOChatProps) => makeRequest(HttpMethod.POST, `/chat/users/remove`, props),
};

type GetMessagesProps = {
	sessionId: string,
	chatId: string,
	page: number,
	pageMessagesCount: number,
}

type AddMessageProps = {
	sessionId: string,
	chatId: string,
	text: string,
	attachmentsIds: Array<string>,
}

type DeleteMessageProps = {
	sessionId: string,
	messageId: string,
}

type EditMessageProps = {
	sessionId: string,
	messageId: string,
	text: string,
}

const Message = {
	get: ({sessionId, page, pageMessagesCount, chatId}: GetMessagesProps) => makeRequest(HttpMethod.GET, `/messages/${chatId}`, {sessionId, page, pageMessagesCount}),
	add: ({sessionId, chatId, text, attachmentsIds}: AddMessageProps) => makeRequest(HttpMethod.POST, `/message/add/${chatId}`, {sessionId, text, attachmentsIds}),
	delete: ({sessionId, messageId}: DeleteMessageProps) => makeRequest(HttpMethod.POST, `/message/delete`, {sessionId, messageId}),
	edit: ({sessionId, messageId, text}: EditMessageProps) => makeRequest(HttpMethod.POST, `/message/edit`, {sessionId, messageId, text}),
};

export {User, Resource, Chat, Message};

