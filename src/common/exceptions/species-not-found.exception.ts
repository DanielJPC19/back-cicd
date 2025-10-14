import { NotFoundException } from '@nestjs/common';

export class SpeciesNotFoundException extends NotFoundException {
	constructor(id: string) {
		super(`No se encontró la especie con ID: ${id}`);
	}
}