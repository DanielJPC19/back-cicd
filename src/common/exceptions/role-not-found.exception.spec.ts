import { HttpStatus } from '@nestjs/common';
import { RoleNotFoundException } from './role-not-found.exception';

describe('RoleNotFoundException', () => {
  it('should be defined', () => {
    expect(RoleNotFoundException).toBeDefined();
  });

  it('should create exception with default message', () => {
    const exception = new RoleNotFoundException();
    
    expect(exception).toBeInstanceOf(RoleNotFoundException);
    expect(exception.message).toBe('No roles found');
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should create exception with role ID', () => {
    const roleId = 123;
    const exception = new RoleNotFoundException(roleId);
    
    expect(exception.message).toBe(`Role with id ${roleId} does not exist`);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should create exception with role name', () => {
    const roleName = 'admin';
    const exception = new RoleNotFoundException(roleName);
    
    expect(exception.message).toBe(`Role with name "${roleName}" does not exist`);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should create exception with custom error code', () => {
    const roleId = 456;
    const errorCode = 'ROLE_001';
    const exception = new RoleNotFoundException(roleId, errorCode);
    
    expect(exception.message).toBe(`Role with id ${roleId} does not exist`);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });
});