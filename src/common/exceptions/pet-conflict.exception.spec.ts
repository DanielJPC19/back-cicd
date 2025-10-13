import { PetConflictException } from './pet-conflict.exception';

describe('PetConflictException', () => {
	it('should create exception with pet id', () => {
		const exception = new PetConflictException(123);
		
		expect(exception.message).toBe('Pet with id 123 already exists or has a conflict');
	});

	it('should create exception with microchip string', () => {
		const exception = new PetConflictException('MICROCHIP123');
		
		expect(exception.message).toBe('Pet with microchip MICROCHIP123 already exists');
	});

	it('should create exception with default message when no pet provided', () => {
		const exception = new PetConflictException();
		
		expect(exception.message).toBe('Pet conflict detected');
	});
});