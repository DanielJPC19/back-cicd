import { ConflictException } from '@nestjs/common';

export class MedicalRecordConflictException extends ConflictException {
	constructor(petId: number) {
		super(`La mascota con ID ${petId} ya tiene un registro médico. Solo se permite un registro médico por mascota.`);
	}
}
