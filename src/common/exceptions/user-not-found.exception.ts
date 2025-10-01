import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
	constructor(user?: number | string, code?: string) {
		let message: string;

		if (typeof user === 'number') {
			message = `User with id ${user} does not exist`;
		} else if (typeof user === 'string') {
			message = `User with email ${user} does not exist`;
		} else {
			message = 'No users found';
		}

		super({
			error: 'User Not Found',
			message,
			code,
		});
	}
}
