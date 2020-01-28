import {readFileSync} from "fs";
import {getLoggedUser, usersData} from "./common/data/user";
import {initTestServer} from "./common/initTestServer";
import {dropDatabase, initDatabase} from "../src/model/sql/initDatabase";
import {TestDatabaseConfig} from "../src/configs/TestDatabaseConfig";
import {Resource} from "./common/requests";

beforeAll(initTestServer);
beforeEach(() => initDatabase(TestDatabaseConfig));
const [firstUser, secondUser] = usersData;
afterEach(() => dropDatabase(TestDatabaseConfig));

const file = readFileSync('tests/common/data/file.txt');

it('can be uploaded by user', async () => {
	const {sessionId} = await getLoggedUser(firstUser);
	const {url, fileId} = await Resource.upload({
		sessionId,
		fileName: 'file.txt',
		file,
	});
	await expect(Resource.get(url)).resolves.toEqual(file.toString());
	await Resource.delete({
		sessionId,
		fileId,
	});
});

it('can be deleted by owner', async () => {
	const {sessionId: firstUserSessionId} = await getLoggedUser(firstUser);
	const {sessionId: secondUserSessionId} = await getLoggedUser(secondUser);
	const {url, fileId} = await Resource.upload({
		sessionId: firstUserSessionId,
		fileName: 'file.txt',
		file,
	});
	await expect(Resource.get(url)).resolves.toEqual(file.toString());
	await expect(Resource.delete({
		sessionId: secondUserSessionId,
		fileId,
	})).rejects.toBeTruthy();
	await expect(Resource.delete({
		sessionId: firstUserSessionId,
		fileId,
	})).resolves.toBeUndefined();
	await expect(Resource.get(url)).resolves.toBe("Not Found");
});