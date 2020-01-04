import {User} from "../../model/User";

export interface ISessionContext {
	setLoggedUser(user: User | null):  void;
	loggedUser(): User | null;
}