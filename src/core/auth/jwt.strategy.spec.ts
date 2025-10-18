import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotFoundException } from '../../common/exceptions';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from './users/users.service';

describe('JwtStrategy', () => {
	let strategy: JwtStrategy;
	let usersService: UsersService;

	const mockUsersService = {
		findOne: jest.fn(),
	};

	const mockConfigService = {
		get: jest.fn().mockReturnValue('test-secret'),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				JwtStrategy,
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
			],
		}).compile();

		strategy = module.get<JwtStrategy>(JwtStrategy);
		usersService = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(strategy).toBeDefined();
	});

	describe('validate', () => {
		it('should return user when valid payload is provided', async () => {
			const mockUser = {
				id: 1,
				email: 'test@example.com',
				name: 'Test User',
				role: { id: 1, name: 'user', permissions: [] }
			};

			const payload = { 
				sub: 1, 
				email: 'test@example.com', 
				permissions: ['read', 'write'] 
			};
			mockUsersService.findOne.mockResolvedValue(mockUser);

			const result = await strategy.validate(payload);

			expect(result).toEqual(mockUser);
			expect(usersService.findOne).toHaveBeenCalledWith(1);
		});

		it('should return UserNotFoundException when user is not found', async () => {
			const payload = { 
				sub: 1, 
				email: 'nonexistent@example.com', 
				permissions: ['read'] 
			};
			mockUsersService.findOne.mockResolvedValue(null);

			const result = await strategy.validate(payload);

			expect(result).toBeInstanceOf(UserNotFoundException);
			expect(usersService.findOne).toHaveBeenCalledWith(1);
		});

		it('should handle payload with different permissions', async () => {
			const mockUser = {
				id: 2,
				email: 'admin@example.com',
				name: 'Admin User',
				role: { id: 2, name: 'admin', permissions: ['admin'] }
			};

			const payload = { 
				sub: 2, 
				email: 'admin@example.com', 
				permissions: ['admin', 'write', 'read'] 
			};
			mockUsersService.findOne.mockResolvedValue(mockUser);

			const result = await strategy.validate(payload);

			expect(result).toEqual(mockUser);
			expect(usersService.findOne).toHaveBeenCalledWith(2);
		});
	});
});