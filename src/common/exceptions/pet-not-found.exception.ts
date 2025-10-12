import { NotFoundException } from '@nestjs/common';

export class PetNotFoundException extends NotFoundException {
	constructor(pet?: number | string, code?: string) {
		let message: string;

		if (typeof pet === 'number') {
			message = `Pet with id ${pet} does not exist`;
		} else if (typeof pet === 'string') {
			message = `Pet with name ${pet} does not exist`;
		} else {
			message = 'No pets found';
		}

		super({
			error: 'Pet Not Found',
			message,
			code,
		});
	}
}