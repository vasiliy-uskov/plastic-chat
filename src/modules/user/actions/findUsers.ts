import {Pool} from "mysql";
import {deleteNullFields} from "../../../core/utils/typeutils";
import {genderToString, User} from "../../../model/User";

type Props = {
	search: string,
	dataBaseConnection: Pool,
}

type Out = {
	users: Array<{
		id: string,
		firstName?: string,
		lastName?: string,
		email: string,
		gender: ('male'|'female'),
	}>
}

export async function findUsers({dataBaseConnection, search}: Props): Promise<Out> {
	const users = await User.find(dataBaseConnection, search);
	return {
		users: users.map(user => deleteNullFields({
			id: user.id(),
			firstName: user.firstName(),
			lastName: user.lastName(),
			email: user.email(),
			gender: genderToString(user.gender()),
		})),
	}
}