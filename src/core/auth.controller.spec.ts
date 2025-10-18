import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserLoginDto } from './auth/dto/login-user.dto';

describe('AuthController', () => {
	let controller: AuthController;

	const mockAuthService = {
		login: jest.fn(),
		validateUser: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: mockAuthService,
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('login', () => {
		it('should return access token on successful login', async () => {
			const userLoginDto: UserLoginDto = {
				email: 'test@example.com',
				password: 'password123',
			};

			const expectedResult = {
				access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
			};

			mockAuthService.login.mockResolvedValue(expectedResult);

			const result = await controller.login(userLoginDto);

			expect(mockAuthService.login).toHaveBeenCalledWith(userLoginDto);
			expect(result).toEqual(expectedResult);
		});

		it('should handle login with different credentials', async () => {
			const userLoginDto: UserLoginDto = {
				email: 'admin@example.com',
				password: 'admin123',
			};

			const expectedResult = {
				access_token: 'different.jwt.token',
			};

			mockAuthService.login.mockResolvedValue(expectedResult);

			const result = await controller.login(userLoginDto);

			expect(mockAuthService.login).toHaveBeenCalledWith(userLoginDto);
			expect(result).toEqual(expectedResult);
		});
	});
});
