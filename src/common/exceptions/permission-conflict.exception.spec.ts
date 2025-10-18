import { HttpStatus } from '@nestjs/common';
import { PermissionConflict } from './permission-conflict.exception';

describe('PermissionConflict', () => {
	it('should be defined', () => {
		expect(PermissionConflict).toBeDefined();
	});

	it('should create exception with permission ID', () => {
		const permissionId = 123;
		const exception = new PermissionConflict(permissionId);
    
		expect(exception).toBeInstanceOf(PermissionConflict);
		expect(exception.message).toBe(`Permission with ID ${permissionId} already exists`);
		expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
	});

	it('should create exception with permission name', () => {
		const permissionName = 'admin';
		const exception = new PermissionConflict(permissionName);
    
		expect(exception.message).toBe(`Permission with name "${permissionName}" already exists`);
		expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
	});

	it('should create exception with custom error code', () => {
		const permissionName = 'write';
		const errorCode = 'PERM_001';
		const exception = new PermissionConflict(permissionName, errorCode);
    
		expect(exception.message).toBe(`Permission with name "${permissionName}" already exists`);
		expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
	});
});