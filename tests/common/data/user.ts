import {User} from "../requests";

export const usersData = [{
	firstName: 'John',
	lastName: 'Last',
	email: 'john@luker.com',
	password: '12345Q',
	gender: 'male',
}, {
	firstName: 'Ivan',
	lastName: 'Pupkin',
	email: 'iva@pupka.com',
	password: '12345',
	gender: 'male',
}, {
	firstName: 'Eva',
	lastName: 'Bagrova',
	email: 'eva@bag.com',
	password: '1234',
	gender: 'female',
}];

export type UserData = {
	firstName: string,
	lastName: string,
	email: string,
	password: string,
	gender: string,
	avatarUrl?: string,
}

export async function registerUsers(...users: Array<UserData>): Promise<Array<UserData & {id: string}>> {
	return (await Promise.all(users.map(user => User.register(user))))
		.map(({userId}, index) => ({
			...users[index],
			id: userId,
		}));
}

export async function getLoggedUser(userData: UserData): Promise<UserData & {sessionId: string, id: string}> {
	const [user] = await registerUsers(userData);
	const {sessionId} = await User.login(user);
	return {
		...user,
		sessionId,
	}
}