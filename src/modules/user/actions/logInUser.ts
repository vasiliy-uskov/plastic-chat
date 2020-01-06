import {Pool} from "mysql";
import {User} from "../../../model/User";
import {HttpError} from "../../../core/http/HttpError";
import {HttpStatus} from "../../../core/http/HttpStatuses";

type Props = {
	email: string,
	password: string,
	dataBaseConnection: Pool,
}

export async function logInUser({password, email, dataBaseConnection}: Props): Promise<{ userId: string }> {
	const user = await User.verifyLogIn(dataBaseConnection, email, password);
	if (!user) {
		throw new HttpError(HttpStatus.BAD_REQUEST, 'Wrong email or password');
	}
	return { userId: user.id() };
}