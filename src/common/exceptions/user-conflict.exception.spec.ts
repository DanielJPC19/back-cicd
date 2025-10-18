import { HttpStatus } from '@nestjs/common';
import { UserConflict } from './user-conflict.exception';

describe('UserConflict', () => {
	it('should be defined', () => {
		expect(UserConflict).toBeDefined();
	});

	it('should create exception with user ID', () => {
		const userId = 123;
		const exception = new UserConflict(userId);
    
		expect(exception).toBeInstanceOf(UserConflict);
		expect(exception.message).toBe(`User with ID ${userId} already exists`);
		expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
	});

	it('should create exception with user email', () => {
		const userEmail = 'test@example.com';
		const exception = new UserConflict(userEmail);
    
		expect(exception.message).toBe(`User with email "${userEmail}" already exists`);
		expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
	});

	it('should create exception with custom error code', () => {
		const userEmail = 'admin@example.com';
		const errorCode = 'USER_001';
		const exception = new UserConflict(userEmail, errorCode);
    
		expect(exception.message).toBe(`User with email "${userEmail}" already exists`);
		expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
	});
});