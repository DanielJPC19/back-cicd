import { ConflictException } from "@nestjs/common";


export class RoleConflict extends ConflictException {

	constructor(role: number | string , code?: string){


		let message: string
	
		if (typeof role === 'number') {
			message = `Role with ID ${role} already exists`;
		
		} else {
			message = `Role with name "${role}" already exists`;
		}

		super({
			error: 'Role already exists',
			message,
			code,
		});
	}


}
