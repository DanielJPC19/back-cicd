import { ConflictException } from '@nestjs/common';

export class DiagnosticTypeConflictException extends ConflictException {
	constructor(name: string) {
		super(`Ya existe un tipo de diagnóstico con el nombre: ${name}`);
	}
}