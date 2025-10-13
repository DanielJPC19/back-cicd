import { HttpStatus } from '@nestjs/common';
import { RoleConflict } from './role-conflict.exception';

describe('RoleConflict', () => {
  it('should be defined', () => {
    expect(RoleConflict).toBeDefined();
  });

  it('should create exception with role ID', () => {
    const roleId = 123;
    const exception = new RoleConflict(roleId);
    
    expect(exception).toBeInstanceOf(RoleConflict);
    expect(exception.message).toBe(`Role with ID ${roleId} already exists`);
    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('should create exception with role name', () => {
    const roleName = 'admin';
    const exception = new RoleConflict(roleName);
    
    expect(exception.message).toBe(`Role with name "${roleName}" already exists`);
    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('should create exception with custom error code', () => {
    const roleName = 'manager';
    const errorCode = 'ROLE_001';
    const exception = new RoleConflict(roleName, errorCode);
    
    expect(exception.message).toBe(`Role with name "${roleName}" already exists`);
    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
  });
});