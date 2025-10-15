import { ConflictException } from '@nestjs/common';

export class PetConflictException extends ConflictException {
	constructor(pet?: number | string, code?: string) {
		let message: string;

		if (typeof pet === 'number') {
			message = `Pet with id ${pet} already exists or has a conflict`;
		} else if (typeof pet === 'string') {
			message = `Pet with microchip ${pet} already exists`;
		} else {
			message = 'Pet conflict detected';
		}

		super({
			error: 'Pet Conflict',
			message,
			code,
		});
	}
}