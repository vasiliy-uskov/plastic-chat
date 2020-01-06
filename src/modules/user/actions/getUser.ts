import {Pool} from "mysql";
import {genderToString, User} from "../../../model/User";

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
	const avatar = await user.avatar(dataBaseConnection);
	const out: Out = {
		gender: genderToString(user.gender()),
		email: user.email(),
	};
	const firstName = user.firstName();
	if (firstName) {
		out.firstName = firstName;
	}
	const lastName = user.lastName();
	if (lastName) {
		out.lastName = lastName;
	}
	if (avatar) {
		out.avatarUrl = avatar.url();
	}
	return out;
}