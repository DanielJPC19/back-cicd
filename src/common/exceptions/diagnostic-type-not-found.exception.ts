import { NotFoundException } from '@nestjs/common';

export class DiagnosticTypeNotFoundException extends NotFoundException {
	constructor(id: string) {
		super(`No se encontró el tipo de diagnóstico con ID: ${id}`);
	}
}