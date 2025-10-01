import { ConflictException } from "@nestjs/common";


export class UserConflict extends ConflictException {

	constructor(user: number | string , code?: string){


		let message: string
	
		if (typeof user === 'number') {
			message = `User with ID ${user} already exists`;
		
		} else {
			message = `User with name "${user}" already exists`;
		}

		super({
			error: 'User already exists',
			message,
			code,
		});
	}


}
