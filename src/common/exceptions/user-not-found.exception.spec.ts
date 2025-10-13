import { HttpStatus } from '@nestjs/common';
import { UserNotFoundException } from './user-not-found.exception';

describe('UserNotFoundException', () => {
  it('should be defined', () => {
    expect(UserNotFoundException).toBeDefined();
  });

  it('should create exception with default message', () => {
    const exception = new UserNotFoundException();
    
    expect(exception).toBeInstanceOf(UserNotFoundException);
    expect(exception.message).toBe('No users found');
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should create exception with user ID', () => {
    const userId = 123;
    const exception = new UserNotFoundException(userId);
    
    expect(exception.message).toBe(`User with id ${userId} does not exist`);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should create exception with user email', () => {
    const userEmail = 'test@example.com';
    const exception = new UserNotFoundException(userEmail);
    
    expect(exception.message).toBe(`User with email ${userEmail} does not exist`);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should create exception with custom error code', () => {
    const userId = 456;
    const errorCode = 'USER_001';
    const exception = new UserNotFoundException(userId, errorCode);
    
    expect(exception.message).toBe(`User with id ${userId} does not exist`);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });
});