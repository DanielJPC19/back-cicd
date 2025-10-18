import { HttpStatus } from '@nestjs/common';
import { PermissionNotFoundException } from './permission-not-found.exception';

describe('PermissionNotFoundException', () => {
	it('should be defined', () => {
		expect(PermissionNotFoundException).toBeDefined();
	});

	it('should create exception with default message', () => {
		const exception = new PermissionNotFoundException();
    
		expect(exception).toBeInstanceOf(PermissionNotFoundException);
		expect(exception.message).toBe('No permissions found');
		expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
	});

	it('should create exception with permission ID', () => {
		const permissionId = 123;
		const exception = new PermissionNotFoundException(permissionId);
    
		expect(exception.message).toBe(`Permission with ID ${permissionId} does not exist`);
		expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
	});

	it('should create exception with permission name', () => {
		const permissionName = 'admin';
		const exception = new PermissionNotFoundException(permissionName);
    
		expect(exception.message).toBe(`Permission with name "${permissionName}" does not exist`);
		expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
	});

	it('should create exception with custom error code', () => {
		const permissionId = 456;
		const errorCode = 'PERM_001';
		const exception = new PermissionNotFoundException(permissionId, errorCode);
    
		expect(exception.message).toBe(`Permission with ID ${permissionId} does not exist`);
		expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
	});
});