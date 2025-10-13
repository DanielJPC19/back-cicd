import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserNotFoundException } from '../common/exceptions';
import { AuthService } from './auth.service';
import { UserLoginDto } from './auth/dto/login-user.dto';
import { UsersService } from './auth/users/users.service';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = jest.mocked(bcrypt);

describe('AuthService', () => {
	let service: AuthService;
	let usersService: UsersService;
	let jwtService: JwtService;

	const mockUsersService = {
		findByEmail: jest.fn(),
	};

	const mockJwtService = {
		sign: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		usersService = module.get<UsersService>(UsersService);
		jwtService = module.get<JwtService>(JwtService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('validateUser', () => {
		it('should return user when credentials are valid', async () => {
			const mockUser = {
				id: 1,
				email: 'test@example.com',
				password: 'hashedPassword',
			};

			mockUsersService.findByEmail.mockResolvedValue(mockUser);
			mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);

			const result = await service.validateUser('test@example.com', 'password123');

			expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
			expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 'hashedPassword');
			expect(result).toEqual(mockUser);
		});

		it('should throw UserNotFoundException when user is not found', async () => {
			mockUsersService.findByEmail.mockResolvedValue(null);

			await expect(service.validateUser('nonexistent@example.com', 'password123'))
				.rejects.toThrow(UserNotFoundException);

			expect(mockUsersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
		});

		it('should throw UnauthorizedException when password does not match', async () => {
			const mockUser = {
				id: 1,
				email: 'test@example.com',
				password: 'hashedPassword',
			};

			mockUsersService.findByEmail.mockResolvedValue(mockUser);
			mockedBcrypt.hash.mockResolvedValue(null as never); // bcrypt.hash returning null/falsy to trigger UnauthorizedException

			await expect(service.validateUser('test@example.com', 'wrongPassword'))
				.rejects.toThrow(UnauthorizedException);

			expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
			expect(mockedBcrypt.hash).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
		});
	});

	describe('login', () => {
		it('should return access token when login is successful', async () => {
			const userLoginDto: UserLoginDto = {
				email: 'test@example.com',
				password: 'password123',
			};

			const mockUser = {
				id: 1,
				email: 'test@example.com',
				password: 'hashedPassword',
				role: {
					permissions: [
						{ permissionName: 'user_read' },
						{ permissionName: 'user_create' },
					],
				},
			};

			const mockToken = 'jwt.token.here';

			mockUsersService.findByEmail.mockResolvedValue(mockUser);
			mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
			mockJwtService.sign.mockReturnValue(mockToken);

			const result = await service.login(userLoginDto);

			expect(mockJwtService.sign).toHaveBeenCalledWith({
				sub: mockUser.id,
				email: mockUser.email,
				permissions: ['user_read', 'user_create'],
			});
			expect(result).toEqual({ access_token: mockToken });
		});

		it('should handle user with no permissions', async () => {
			const userLoginDto: UserLoginDto = {
				email: 'test@example.com',
				password: 'password123',
			};

			const mockUser = {
				id: 1,
				email: 'test@example.com',
				password: 'hashedPassword',
				role: {
					permissions: [],
				},
			};

			const mockToken = 'jwt.token.here';

			mockUsersService.findByEmail.mockResolvedValue(mockUser);
			mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
			mockJwtService.sign.mockReturnValue(mockToken);

			const result = await service.login(userLoginDto);

			expect(mockJwtService.sign).toHaveBeenCalledWith({
				sub: mockUser.id,
				email: mockUser.email,
				permissions: [],
			});
			expect(result).toEqual({ access_token: mockToken });
		});
	});
});
