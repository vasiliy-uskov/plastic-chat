import {Server} from "../../src/core/http/Server";
import {TestDatabaseConfig} from "../../src/configs/TestDatabaseConfig";
import {initializeChatRouts} from "../../src/modules/chat/routs";
import {initializeResourceRouts} from "../../src/modules/resource/routs";
import {initializeUserRouts} from "../../src/modules/user/routs";
import {initializeMessageRouts} from "../../src/modules/message/routs";
import {TestServerConfig} from "../../src/configs/TestServerConfig";

export function initTestServer(): void {
	try {
		new Server(TestDatabaseConfig, [
			initializeChatRouts,
			initializeResourceRouts,
			initializeUserRouts,
			initializeMessageRouts
		]).start(TestServerConfig);
	}
	catch (e) {}
}