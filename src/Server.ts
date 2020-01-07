import * as express from "express";
import {ServerConfig} from "./configs/ServerConfig";
import {SessionsManager} from "./core/session/SessionManager";
import {resolve} from "path";
import {File} from "./model/File";
import {Router} from "./core/routing/Router";
import {createPool} from "mysql";
import {DatabaseConfig} from "./configs/DatabaseConfig";
import * as bodyParser from "body-parser";
import {initializeResourceRouts} from "./modules/resource/routs";
import {initializeUserRouts} from "./modules/user/routs";
import {initializeChatRouts} from "./modules/chat/routs";

export class Server {
	constructor() {
		this._app.use(File.SERVICE_FILE_STORAGE, express.static(resolve(File.LOCAL_FILE_STORAGE)));
		this._app.use(bodyParser.json());
		this._app.use(bodyParser.urlencoded({ extended: true }));
		const router = new Router(this._app, this._sessionsManager, createPool(DatabaseConfig));
		initializeUserRouts(router);
		initializeResourceRouts(router);
		initializeChatRouts(router);
		this._app.use((req, res) => { res.sendStatus(404); })
	}

	start() {
		this._app.listen(ServerConfig.port, () => {
			console.log("Start listening port: ", ServerConfig.port);
		});
	}

	private readonly _app = express();
	private readonly _sessionsManager = new SessionsManager();
}