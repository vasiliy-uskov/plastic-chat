import {User} from "../../model/User";

export interface ISessionManager {
	init(user: User): string;

	delete(sessionId: string): void;

	loggedUser(sessionId: string): User | null;
}