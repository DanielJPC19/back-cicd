import { UserOutDto } from './out-user.dto';

describe('UserOutDto', () => {
  it('should be defined', () => {
    expect(UserOutDto).toBeDefined();
  });

  it('should create an instance with all properties', () => {
    const userOutDto = new UserOutDto();
    
    expect(userOutDto).toBeInstanceOf(UserOutDto);
    expect(userOutDto).toBeDefined();
  });

  it('should allow setting properties', () => {
    const userOutDto = new UserOutDto();
    userOutDto.email = 'test@example.com';
    userOutDto.firstName = 'Juan';
    userOutDto.lastName = 'Pérez';
    userOutDto.phoneNumber = '3001234567';
    userOutDto.address = 'Calle Falsa 123';
    
    expect(userOutDto.email).toBe('test@example.com');
    expect(userOutDto.firstName).toBe('Juan');
    expect(userOutDto.lastName).toBe('Pérez');
    expect(userOutDto.phoneNumber).toBe('3001234567');
    expect(userOutDto.address).toBe('Calle Falsa 123');
  });

  it('should not have password property', () => {
    const userOutDto = new UserOutDto();
    
    expect(userOutDto).not.toHaveProperty('password');
  });

  it('should allow optional profile picture', () => {
    const userOutDto = new UserOutDto();
    userOutDto.profilePicture = 'https://example.com/profile.jpg';
    
    expect(userOutDto.profilePicture).toBe('https://example.com/profile.jpg');
  });
});