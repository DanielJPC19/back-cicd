import { NotFoundException } from '@nestjs/common';

export class RoleNotFoundException extends NotFoundException {
	constructor(role?: string | number, code?: string) {
		let message: string;

		if (typeof role === 'number') {
			message = `Role with id ${role} does not exist`;
		} else if (typeof role === 'string') {
			message = `Role with name "${role}" does not exist`;
		} else {
			message = 'No roles found';
		}

		super({
			error: 'Role Not Found',
			message,
			code,
		});
	}
}
