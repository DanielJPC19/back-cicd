import { MedicalRecordNotFoundException } from './medical-record-not-found.exception';

describe('MedicalRecordNotFoundException', () => {
	it('should create exception with medical record id', () => {
		const exception = new MedicalRecordNotFoundException(123);
		
		expect(exception.message).toBe('Medical record with id 123 does not exist');
	});

	it('should create exception with string identifier', () => {
		const exception = new MedicalRecordNotFoundException('ABC123');
		
		expect(exception.message).toBe('Medical record ABC123 does not exist');
	});

	it('should create exception with default message when no id provided', () => {
		const exception = new MedicalRecordNotFoundException();
		
		expect(exception.message).toBe('No medical records found');
	});
});