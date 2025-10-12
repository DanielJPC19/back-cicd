import { NotFoundException } from '@nestjs/common';

export class MedicalRecordNotFoundException extends NotFoundException {
	constructor(medicalRecord?: number | string, code?: string) {
		let message: string;

		if (typeof medicalRecord === 'number') {
			message = `Medical record with id ${medicalRecord} does not exist`;
		} else if (typeof medicalRecord === 'string') {
			message = `Medical record ${medicalRecord} does not exist`;
		} else {
			message = 'No medical records found';
		}

		super({
			error: 'Medical Record Not Found',
			message,
			code,
		});
	}
}