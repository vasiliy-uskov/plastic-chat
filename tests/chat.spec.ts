import {getLoggedUser, usersData} from "./common/data/user";
import { Chat, User } from "./common/requests";
import {initTestServer} from "./common/initTestServer";
import {dropDatabase, initDatabase} from "../src/model/sql/initDatabase";
import {TestDatabaseConfig} from "../src/configs/TestDatabaseConfig";

beforeAll(initTestServer);
beforeEach(() => initDatabase(TestDatabaseConfig));
const [firstUser, secondUser] = usersData;
afterEach(() => dropDatabase(TestDatabaseConfig));

const chatName = 'My new chat';

it('can not get undefined chat', async () => {
	const user = await getLoggedUser(firstUser);
	await expect(Chat.get({sessionId: user.sessionId, chatId: 'someId'})).rejects.toBeTruthy()
});

it('chat name shouldn`t be empty', async () => {
	const owner = await getLoggedUser(firstUser);
	await expect(Chat.add({
		sessionId: owner.sessionId,
		name: '',
	})).rejects.toBeTruthy();
});

it('can be created by user', async () => {
	const owner = await getLoggedUser(firstUser);
	const {chatId} = await Chat.add({
		sessionId: owner.sessionId,
		name: chatName,
	});
	await expect(Chat.get({sessionId: owner.sessionId, chatId})).resolves.toEqual({
		name: chatName,
		users: [{
			id: owner.id,
			firstName: owner.firstName,
			lastName: owner.lastName,
			email: owner.email,
			gender: owner.gender,
		}]
	});
	await User.logout(owner.sessionId);
});

it('can be edited by user', async () => {
	const owner = await getLoggedUser(firstUser);
	const {chatId} = await Chat.add({
		sessionId: owner.sessionId,
		name: chatName,
	});
	const newChatName = 'New chat name';
	await Chat.edit({
		sessionId: owner.sessionId,
		chatId,
		name: newChatName,
	});
	await expect(Chat.get({sessionId: owner.sessionId, chatId})).resolves.toEqual({
		name: newChatName,
		users: [{
			id: owner.id,
			firstName: owner.firstName,
			lastName: owner.lastName,
			email: owner.email,
			gender: owner.gender,
		}]
	})
});

it('can not be get by another user', async () => {
	const owner = await getLoggedUser(firstUser);
	const otherUser = await getLoggedUser(secondUser);
	const {chatId} = await Chat.add({
		sessionId: owner.sessionId,
		name: chatName,
	});
	await expect(Chat.get({sessionId: otherUser.sessionId, chatId})).rejects.toBeTruthy();
	await User.logout(owner.sessionId);
	await User.logout(otherUser.sessionId);
});

it('can be deleted by user', async () => {
	const owner = await getLoggedUser(firstUser);
	const {chatId} = await Chat.add({
		sessionId: owner.sessionId,
		name: chatName,
	});
	await Chat.delete({sessionId: owner.sessionId, chatId});
	await expect(Chat.get({sessionId: owner.sessionId, chatId})).rejects.toBeTruthy();
});

it('can manage chat`s users list', async () => {
	const owner = await getLoggedUser(firstUser);
	const {chatId} = await Chat.add({
		sessionId: owner.sessionId,
		name: chatName,
	});
	const anotherUser = await getLoggedUser(secondUser);
	await Chat.addUsers({
		sessionId: owner.sessionId,
		chatId,
		usersIds: [anotherUser.id],
	});
	const chatInfo = await Chat.get({sessionId: anotherUser.sessionId, chatId});
	expect(chatInfo.users).toContainEqual({
		id: owner.id,
		firstName: owner.firstName,
		lastName: owner.lastName,
		email: owner.email,
		gender: owner.gender,
	});
	expect(chatInfo.users).toContainEqual({
		id: anotherUser.id,
		firstName: anotherUser.firstName,
		lastName: anotherUser.lastName,
		email: anotherUser.email,
		gender: anotherUser.gender,
	});
	await Chat.removeUsers({
		sessionId: anotherUser.sessionId,
		chatId,
		usersIds: [anotherUser.id],
	});
	await expect(Chat.get({sessionId: owner.sessionId, chatId})).resolves.toEqual({
		name: chatName,
		users: [{
			id: owner.id,
			firstName: owner.firstName,
			lastName: owner.lastName,
			email: owner.email,
			gender: owner.gender,
		}]
	})
});

it('delete when last user go out from', async () => {
	const owner = await getLoggedUser(firstUser);
	const {chatId} = await Chat.add({
		sessionId: owner.sessionId,
		name: chatName,
	});
	await Chat.removeUsers({
		sessionId: owner.sessionId,
		chatId,
		usersIds: [owner.id],
	});
	await expect(Chat.get({sessionId: owner.sessionId, chatId})).rejects.toBeTruthy();
});