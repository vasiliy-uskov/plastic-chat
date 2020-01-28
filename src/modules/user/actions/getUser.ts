import {Pool} from "mysql";
import {genderToString, User} from "../../../model/User";
import {deleteNullFields} from "../../../core/utils/typeutils";
import {HttpError} from "../../../core/http/HttpError";
import {HttpStatus} from "../../../core/http/HttpStatuses";

type Props = {
	userId: string,
	dataBaseConnection: Pool,
}

type Out = {
	firstName?: string,
	lastName?: string,
	avatarUrl?: string,
	gender: ('male'|'female'),
	email: string,
}

export async function getUser({userId, dataBaseConnection}: Props): Promise<Out> {
	const user = await User.get(dataBaseConnection, userId);
	if (!user) {
		throw new HttpError(HttpStatus.NOT_FOUND, 'User not found');
	}
	const avatar = await user.avatar(dataBaseConnection);
	return deleteNullFields({
		firstName: user.firstName(),
		lastName: user.lastName(),
		gender: genderToString(user.gender()),
		email: user.email(),
		avatarUrl: avatar && avatar.url(),
	});
}