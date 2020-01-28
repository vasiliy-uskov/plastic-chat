import * as express from "express";
import {SessionsManager} from "../session/SessionManager";
import {resolve} from "path";
import {File} from "../../model/File";
import {Router} from "../routing/Router";
import {createPool, PoolConfig} from "mysql";
import * as bodyParser from "body-parser";
import {IRouter} from "../routing/IRouter";

export class Server {
	constructor(dbConfig: PoolConfig, initializers: Array<(router: IRouter) => void>) {
		this._app.use(File.SERVICE_FILE_STORAGE, express.static(resolve(File.LOCAL_FILE_STORAGE)));
		this._app.use(bodyParser.json());
		this._app.use(bodyParser.urlencoded({ extended: true }));
		const router = new Router(this._app, this._sessionsManager, createPool(dbConfig));
		initializers.forEach(initializer => initializer(router));
		this._app.use((req, res) => { res.sendStatus(404); })
	}

	start({port}: {port: number}) {
		this._app.listen(port, () => {
			console.log("Start listening port: ", port);
		});
	}

	private readonly _app = express();
	private readonly _sessionsManager = new SessionsManager();
}