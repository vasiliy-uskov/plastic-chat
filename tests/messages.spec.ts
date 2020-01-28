import {createChat} from "./common/data/chat";
import {usersData} from "./common/data/user";
import {Message, User} from "./common/requests";
import {initTestServer} from "./common/initTestServer";
import {dropDatabase, initDatabase} from "../src/model/sql/initDatabase";
import {TestDatabaseConfig} from "../src/configs/TestDatabaseConfig";

beforeAll(initTestServer);
beforeEach(() => initDatabase(TestDatabaseConfig));
afterEach(() => dropDatabase(TestDatabaseConfig));

function setTimeoutPromise(timeout: number): Promise<void> {
	return new Promise<void>((resolve => {
		setTimeout(resolve, timeout);
	}))
}

it('can write message in chat', async () => {
	const {chatId, users: [firstUser]} = await createChat('My new chat', usersData);
	const {sessionId} = await User.login(firstUser);
	const text = 'Hellow world';
	const {messageId} = await Message.add({
		sessionId, chatId,
		text,
		attachmentsIds: [],
	});
	const {messages: [message]} = await Message.get({
		sessionId,
		chatId,
		page: 0,
		pageMessagesCount: 1
	});
	expect(message.messageId).toBe(messageId);
	expect(message.text).toBe(text);
	expect(message.attachments).toEqual([]);
	expect(message.addresser).toEqual({
		id: firstUser.id,
		firstName: firstUser.firstName,
		lastName: firstUser.lastName,
		email: firstUser.email,
		gender: firstUser.gender,
	});
});

it('can edit message in chat', async () => {
	const {chatId, users: [firstUser]} = await createChat('My new chat', usersData);
	const {sessionId} = await User.login(firstUser);
	const text = 'Hello world';
	const {messageId} = await Message.add({
		sessionId, chatId,
		text,
		attachmentsIds: [],
	});
	const newText = 'Hello new world';
	await Message.edit({
		sessionId,
		messageId,
		text: newText,
	});
	const {messages: [message]} = await Message.get({
		sessionId,
		chatId,
		page: 0,
		pageMessagesCount: 1
	});
	expect(message.messageId).toBe(messageId);
	expect(message.text).toBe(newText);
	expect(message.attachments).toEqual([]);
});

it('can delete message in chat', async () => {
	const {chatId, users: [firstUser]} = await createChat('My new chat', usersData);
	const {sessionId} = await User.login(firstUser);
	const text = 'Hello world';
	const {messageId} = await Message.add({
		sessionId, chatId,
		text,
		attachmentsIds: [],
	});
	await expect(Message.get({
		sessionId,
		chatId,
		page: 0,
		pageMessagesCount: 1
	})).resolves.toBeTruthy();
	await Message.delete({
		sessionId,
		messageId,
	});
	await expect(Message.get({
		sessionId,
		chatId,
		page: 0,
		pageMessagesCount: 1
	})).resolves.toEqual({
		messages: [],
	});
});

async function addMessage(chatId: string, sessionId: string, text: string): Promise<string> {
	const {messageId} = await Message.add({
		sessionId, chatId,
		text,
		attachmentsIds: [],
	});
	await setTimeoutPromise(1100);
	return messageId;
}

it('messages sort by send date', async () => {
	const {chatId, users: [firstUser]} = await createChat('My new chat', usersData);
	const {sessionId} = await User.login(firstUser);
	const messageId1 = await addMessage(chatId, sessionId, 'message 1');
	const messageId2 = await addMessage(chatId, sessionId, 'message 2');
	const messageId3 = await addMessage(chatId, sessionId, 'message 3');
	const messageId4 = await addMessage(chatId, sessionId, 'message 4');
	const {messages: firstPage} = await Message.get({
		sessionId,
		chatId,
		page: 0,
		pageMessagesCount: 2
	});
	expect(firstPage[0].messageId).toBe(messageId4);
	expect(firstPage[1].messageId).toBe(messageId3);
	const {messages: secondPage} = await Message.get({
		sessionId,
		chatId,
		page: 1,
		pageMessagesCount: 2
	});
	expect(secondPage[0].messageId).toBe(messageId2);
	expect(secondPage[1].messageId).toBe(messageId1);
});