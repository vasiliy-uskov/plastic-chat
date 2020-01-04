import {ISessionContext} from "./ISessionContext";
import {User} from "../../model/User";

export class SessionContext implements ISessionContext {
	setLoggedUser(user: User | null):  void {
		this._loggedUser = user;
	}

	loggedUser(): User | null {
		return this._loggedUser
	}

	private _loggedUser: User | null = null;
}