import {Server} from "./core/http/Server";
import {DatabaseConfig} from "./configs/DatabaseConfig";
import {ServerConfig} from "./configs/ServerConfig";
import {initializeResourceRouts} from "./modules/resource/routs";
import {initializeUserRouts} from "./modules/user/routs";
import {initializeChatRouts} from "./modules/chat/routs";
import {initDatabase} from "./model/sql/initDatabase";
import {initializeMessageRouts} from "./modules/message/routs";

initDatabase(DatabaseConfig);
const server = new Server(DatabaseConfig, [
	initializeChatRouts,
	initializeResourceRouts,
	initializeUserRouts,
	initializeMessageRouts
]);
server.start(ServerConfig);