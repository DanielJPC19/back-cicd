import { PetNotFoundException } from './pet-not-found.exception';

describe('PetNotFoundException', () => {
	it('should create exception with pet id', () => {
		const exception = new PetNotFoundException(123);
		
		expect(exception.message).toBe('Pet with id 123 does not exist');
	});

	it('should create exception with pet name string', () => {
		const exception = new PetNotFoundException('Buddy');
		
		expect(exception.message).toBe('Pet with name Buddy does not exist');
	});

	it('should create exception with default message when no id provided', () => {
		const exception = new PetNotFoundException();
		
		expect(exception.message).toBe('No pets found');
	});
});