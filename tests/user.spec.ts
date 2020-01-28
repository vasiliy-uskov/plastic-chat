import {User} from "./common/requests";
import {registerUsers, UserData, usersData} from "./common/data/user";
import {initTestServer} from "./common/initTestServer";
import {TestDatabaseConfig} from "../src/configs/TestDatabaseConfig";
import {dropDatabase, initDatabase} from "../src/model/sql/initDatabase";

beforeAll(initTestServer);
beforeEach(() => initDatabase(TestDatabaseConfig));
afterEach(() => dropDatabase(TestDatabaseConfig));


it('can not get undefined user', () => expect(User.get('someId')).rejects.toBeTruthy());

it('register new user', async () => {
	const [userData] = usersData;
	const {userId} = await User.register(userData);
	expect(await User.get(userId)).toEqual({
		firstName: userData.firstName,
		lastName: userData.lastName,
		email: userData.email,
		gender: userData.gender,
	})
});

it('can edit user', async () => {
	const [user] = usersData;
	const newUserData = {
		firstName: 'Pip',
		lastName: 'Lil',
		password: '12345QWERTY'
	};
	const {userId} = await User.register(user);
	const {sessionId} = await User.login(user);
	await User.edit({
		sessionId,
		...newUserData,
	});
	expect(await User.get(userId)).toEqual({
		firstName: newUserData.firstName,
		lastName: newUserData.lastName,
		email: user.email,
		gender: user.gender,
	});
	await User.logout(sessionId);
	await expect(User.login(userId)).rejects.toBeTruthy();
});

it('can find user by first name, last name or email', async () => {
	const [user, notRegisteredUser] = usersData;
	const {userId} = await User.register(user);
	const getVariants = (userData: UserData) => [
		userData.firstName,
		userData.lastName,
		userData.firstName + ' ' + userData.lastName,
		userData.email,
	];
	for (const search of getVariants(user)) {
		expect(await User.find(search)).toEqual({
			users: [{
				id: userId,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				gender: user.gender,
			}]
		})
	}
	for (const search of getVariants(notRegisteredUser)) {
		expect(await User.find(search)).toEqual({users: []})
	}
});

it('can manage friend to friendsList', async () => {
	const [firstUser, secondUser] = await registerUsers(...usersData);
	const {sessionId: firstUserSessionId} = await User.login(firstUser);
	const {sessionId: secondUserSessionId} = await User.login(secondUser);
	await User.addFriend({
		sessionId: firstUserSessionId,
		userId: secondUser.id,
	});
	expect(await User.friendsList(firstUserSessionId)).toEqual({
		users: [],
	});
	expect(await User.friendsList(secondUserSessionId)).toEqual({
		users: [],
	});
	await User.addFriend({
		sessionId: secondUserSessionId,
		userId: firstUser.id,
	});
	expect(await User.friendsList(firstUserSessionId)).toEqual({
		users: [{
			id: secondUser.id,
			firstName: secondUser.firstName,
			lastName: secondUser.lastName,
			email: secondUser.email,
			gender: secondUser.gender,
		}],
	});
	expect(await User.friendsList(secondUserSessionId)).toEqual({
		users: [{
			id: firstUser.id,
			firstName: firstUser.firstName,
			lastName: firstUser.lastName,
			email: firstUser.email,
			gender: firstUser.gender,
		}],
	});
	await User.removeFriend({
		sessionId: secondUserSessionId,
		userId: firstUser.id,
	});
	expect(await User.friendsList(firstUserSessionId)).toEqual({
		users: [],
	});
	expect(await User.friendsList(secondUserSessionId)).toEqual({
		users: [],
	});
});