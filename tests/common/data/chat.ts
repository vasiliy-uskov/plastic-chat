import {getLoggedUser, registerUsers, UserData} from "./user";
import {Chat} from "../requests";

export async function createChat(chatName: string, [firstUser, ...usersData]: Array<UserData>): Promise<{chatId: string, users: Array<UserData & {id: string}>}> {
	const owner = await getLoggedUser(firstUser);
	const {chatId} = await Chat.add({
		sessionId: owner.sessionId,
		name: chatName,
	});
	if (!usersData.length) {
		return {
			chatId,
			users: [owner],
		}
	}
	const users = await registerUsers(...usersData);
	await Chat.addUsers({
		sessionId: owner.sessionId,
		chatId,
		usersIds: users.map(({id}) => id),
	});
	return {chatId, users}
}