import { NotFoundException } from '@nestjs/common';

export class PermissionNotFoundException extends NotFoundException {
	constructor(permission?: number | string, code?: string) {
		let message: string;

		if (typeof permission === 'number') {
			message = `Permission with ID ${permission} does not exist`;
		} else if (typeof permission === 'string') {
			message = `Permission with name "${permission}" does not exist`;
		} else {
			message = 'No permissions found';
		}

		super({
			error: 'Permission Not Found',
			message,
			code,
		});
	}
}
