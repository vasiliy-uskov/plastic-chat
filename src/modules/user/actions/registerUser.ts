import {Pool} from "mysql";
import {stringToGender, User} from "../../../model/User";
import {SqlErrorsCode} from "../../../core/bd/SqlErrorsCode";
import {HttpError} from "../../../core/http/HttpError";
import {HttpStatus} from "../../../core/http/HttpStatuses";

type Props = {
	firstName: string|null|undefined,
	lastName: string|null|undefined,
	password: string,
	email: string,
	gender: ('male'|'female'),
	dataBaseConnection: Pool,
}

export async function registerUser({firstName = null, lastName = null, password, email, gender, dataBaseConnection}: Props): Promise<{ userId: string }> {
	const user = User.creat(firstName, lastName, email, password, stringToGender(gender));
	return user.save(dataBaseConnection)
		.then(() => ({ userId: user.id() }))
		.catch(error => {
			if (error.code == SqlErrorsCode.ER_DUP_ENTRY) {
				throw new HttpError(HttpStatus.BAD_REQUEST, 'Email already has used.');
			}
			else {
				throw error;
			}
		})
}