import { ConflictException } from '@nestjs/common';

export class SpeciesConflictException extends ConflictException {
	constructor(name: string) {
		super(`Ya existe una especie con el nombre: ${name}`);
	}
}