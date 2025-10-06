import { ConflictException } from "@nestjs/common";


export class PermissionConflict extends ConflictException {

	constructor(permission: number | string , code?: string){


		let message: string
	
		if (typeof permission === 'number') {
			message = `Permission with ID ${permission} already exists`;
		
		} else {
			message = `Permission with name "${permission}" already exists`;
		}

		super({
			error: 'Permission already exists',
			message,
			code,
		});
	}


}
