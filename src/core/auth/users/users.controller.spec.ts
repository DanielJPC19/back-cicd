import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SetUserRoleDto } from '../dto/update-user-role.dto';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { UserConflict, UserNotFoundException } from '../../../common/exceptions';

describe('UsersController', () => {
	let controller: UsersController;
	let mockUsersService: {
		create: jest.Mock;
		findAll: jest.Mock;
		findOne: jest.Mock;
		update: jest.Mock;
		removeById: jest.Mock;
		setUserRole: jest.Mock;
	};

	const mockPermission: Permission = {
		id: 1,
		permissionName: 'CREATE_USER',
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
	};

	const mockRole: Role = {
		id: 1,
		roleName: 'user',
		description: 'User role',
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
		permissions: [mockPermission],
		users: [],
	};

	const mockUser: User = {
		id: 1,
		email: 'user@example.com',
		firstName: 'John',
		lastName: 'Doe',
		password: 'hashed_password_123',
		phoneNumber: '+1234567890',
		address: '123 Main St',
		isDeleted: false,
		profilePicture: 'profile.jpg',
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
		deletedAt: new Date(),
		role: mockRole,
	};

	const mockUser2: User = {
		id: 2,
		email: 'user2@example.com',
		firstName: 'Jane',
		lastName: 'Smith',
		password: 'hashed_password_456',
		phoneNumber: '+0987654321',
		address: '456 Oak Ave',
		isDeleted: false,
		profilePicture: 'profile2.jpg',
		createdAt: new Date('2025-01-02'),
		updatedAt: new Date('2025-01-02'),
		deletedAt: new Date(),
		role: mockRole,
	};

	beforeEach(async () => {
		mockUsersService = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			removeById: jest.fn(),
			setUserRole: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
			],
		})
			.overrideGuard('AuthGuard')
			.useValue({})
			.overrideGuard('PermissionsGuard')
			.useValue({})
			.compile();

		controller = module.get<UsersController>(UsersController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('should be defined', () => {
		it('should be defined', () => {
			expect(controller).toBeDefined();
		});
	});

	describe('create', () => {
		it('should create a new user successfully', async () => {
			const createDto: CreateUserDto = {
				email: 'user@example.com',
				firstName: 'John',
				lastName: 'Doe',
				password: 'password123',
				phoneNumber: '+1234567890',
				address: '123 Main St',
				profilePicture: 'profile.jpg',
			};

			mockUsersService.create.mockResolvedValue(mockUser);

			const result = await controller.create(createDto);

			expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
			expect(mockUsersService.create).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUser);
			expect(result.id).toBe(1);
			expect(result.email).toBe('user@example.com');
		});

		it('should return created user with all properties', async () => {
			const createDto: CreateUserDto = {
				email: 'newuser@example.com',
				firstName: 'Jane',
				lastName: 'Smith',
				password: 'password456',
				phoneNumber: '+0987654321',
				address: '456 Oak Ave',
				profilePicture: 'profile2.jpg',
			};

			const createdUser: User = {
				id: 5,
				email: 'newuser@example.com',
				firstName: 'Jane',
				lastName: 'Smith',
				password: 'hashed_password',
				phoneNumber: '+0987654321',
				address: '456 Oak Ave',
				isDeleted: false,
				profilePicture: 'profile2.jpg',
				createdAt: new Date('2025-01-05'),
				updatedAt: new Date('2025-01-05'),
				deletedAt: new Date(),
				role: mockRole,
			};

			mockUsersService.create.mockResolvedValue(createdUser);

			const result = await controller.create(createDto);

			expect(result).toEqual(createdUser);
			expect(result.createdAt).toEqual(new Date('2025-01-05'));
			expect(result.role).toBeDefined();
		});

		it('should throw UserConflict when email already exists', async () => {
			const createDto: CreateUserDto = {
				email: 'user@example.com',
				firstName: 'John',
				lastName: 'Doe',
				password: 'password123',
				phoneNumber: '+1234567890',
				address: '123 Main St',
				profilePicture: 'profile.jpg',
			};

			mockUsersService.create.mockRejectedValue(
				new UserConflict('user@example.com'),
			);

			await expect(controller.create(createDto)).rejects.toThrow(
				UserConflict,
			);
			expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
		});

		it('should handle special characters in email', async () => {
			const createDto: CreateUserDto = {
				email: 'user+test@example.co.uk',
				firstName: 'John',
				lastName: 'Doe',
				password: 'password123',
				phoneNumber: '+1234567890',
				address: '123 Main St',
				profilePicture: 'profile.jpg',
			};

			mockUsersService.create.mockResolvedValue(mockUser);

			await controller.create(createDto);

			expect(mockUsersService.create).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'user+test@example.co.uk',
				}),
			);
		});

		it('should pass DTO exactly to service without modification', async () => {
			const createDto: CreateUserDto = {
				email: 'exact@example.com',
				firstName: 'Exact',
				lastName: 'User',
				password: 'password',
				phoneNumber: '+1234567890',
				address: 'Address',
				profilePicture: 'pic.jpg',
			};

			mockUsersService.create.mockResolvedValue(mockUser);

			await controller.create(createDto);

			expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
		});
	});

	describe('findAll', () => {
		it('should return all users', async () => {
			const users: User[] = [mockUser, mockUser2];
			mockUsersService.findAll.mockResolvedValue(users);

			const result = await controller.findAll();

			expect(mockUsersService.findAll).toHaveBeenCalled();
			expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
			expect(result).toEqual(users);
			expect(result.length).toBe(2);
		});

		it('should return empty array when no users exist', async () => {
			mockUsersService.findAll.mockResolvedValue([]);

			const result = await controller.findAll();

			expect(result).toEqual([]);
			expect(result.length).toBe(0);
		});

		it('should return users with their roles', async () => {
			const usersWithRoles: User[] = [
				{
					...mockUser,
					role: mockRole,
				},
				{
					...mockUser2,
					role: mockRole,
				},
			];

			mockUsersService.findAll.mockResolvedValue(usersWithRoles);

			const result = await controller.findAll();

			expect(result[0].role).toBeDefined();
			expect(result[1].role).toBeDefined();
			expect(result[0].role.roleName).toBe('user');
		});

		it('should handle multiple calls', async () => {
			mockUsersService.findAll.mockResolvedValue([mockUser]);

			await controller.findAll();
			await controller.findAll();

			expect(mockUsersService.findAll).toHaveBeenCalledTimes(2);
		});
	});

	describe('findOne', () => {
		it('should find a user by id successfully', async () => {
			mockUsersService.findOne.mockResolvedValue(mockUser);

			const result = await controller.findOne(1);

			expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
			expect(mockUsersService.findOne).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUser);
			expect(result.id).toBe(1);
		});

		it('should return user with all properties', async () => {
			const user: User = {
				id: 42,
				email: 'full@example.com',
				firstName: 'Full',
				lastName: 'User',
				password: 'hashed',
				phoneNumber: '+1234567890',
				address: 'Address',
				isDeleted: false,
				profilePicture: 'pic.jpg',
				createdAt: new Date('2025-01-10'),
				updatedAt: new Date('2025-01-11'),
				deletedAt: new Date(),
				role: mockRole,
			};

			mockUsersService.findOne.mockResolvedValue(user);

			const result = await controller.findOne(42);

			expect(result).toEqual(user);
			expect(result.email).toBe('full@example.com');
			expect(result.role).toBeDefined();
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			mockUsersService.findOne.mockRejectedValue(
				new UserNotFoundException(999),
			);

			await expect(controller.findOne(999)).rejects.toThrow(
				UserNotFoundException,
			);
			expect(mockUsersService.findOne).toHaveBeenCalledWith(999);
		});

		it('should find different users by id', async () => {
			mockUsersService.findOne.mockResolvedValue(mockUser2);

			const result = await controller.findOne(2);

			expect(result).toEqual(mockUser2);
			expect(result.email).toBe('user2@example.com');
		});

		it('should work with various valid IDs', async () => {
			const testIds = [1, 5, 100, 9999];

			for (const id of testIds) {
				const userWithId: User = {
					...mockUser,
					id,
				};
				mockUsersService.findOne.mockResolvedValue(userWithId);

				const result = await controller.findOne(id);

				expect(result.id).toBe(id);
				expect(mockUsersService.findOne).toHaveBeenCalledWith(id);
			}
		});

		it('should handle minimum valid ID (1)', async () => {
			mockUsersService.findOne.mockResolvedValue(mockUser);

			const result = await controller.findOne(1);

			expect(result).toEqual(mockUser);
		});

		it('should handle large ID values', async () => {
			const largeId = 2147483647;
			const userWithLargeId: User = {
				...mockUser,
				id: largeId,
			};

			mockUsersService.findOne.mockResolvedValue(userWithLargeId);

			const result = await controller.findOne(largeId);

			expect(result.id).toBe(largeId);
		});
	});

	describe('update', () => {
		it('should update a user successfully', async () => {
			const updateDto: UpdateUserDto = {
				firstName: 'Johnny',
				lastName: 'Smith',
			};

			const updatedUser: User = {
				...mockUser,
				firstName: 'Johnny',
				lastName: 'Smith',
			};

			mockUsersService.update.mockResolvedValue(updatedUser);

			const result = await controller.update(1, updateDto);

			expect(mockUsersService.update).toHaveBeenCalledWith(1, updateDto);
			expect(mockUsersService.update).toHaveBeenCalledTimes(1);
			expect(result).toEqual(updatedUser);
			expect(result.firstName).toBe('Johnny');
		});

		it('should return updated user with all properties', async () => {
			const updateDto: UpdateUserDto = {
				phoneNumber: '+9999999999',
			};

			const updatedUser: User = {
				...mockUser,
				phoneNumber: '+9999999999',
				updatedAt: new Date('2025-01-15'),
			};

			mockUsersService.update.mockResolvedValue(updatedUser);

			const result = await controller.update(1, updateDto);

			expect(result).toEqual(updatedUser);
			expect(result.phoneNumber).toBe('+9999999999');
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			const updateDto: UpdateUserDto = {
				firstName: 'Johnny',
			};

			mockUsersService.update.mockRejectedValue(
				new UserNotFoundException(999),
			);

			await expect(controller.update(999, updateDto)).rejects.toThrow(
				UserNotFoundException,
			);
		});

		it('should update multiple users sequentially', async () => {
			const updateDto1: UpdateUserDto = {
				firstName: 'Updated1',
			};
			const updateDto2: UpdateUserDto = {
				firstName: 'Updated2',
			};

			const updatedUser1: User = {
				...mockUser,
				firstName: 'Updated1',
			};
			const updatedUser2: User = {
				...mockUser2,
				firstName: 'Updated2',
			};

			mockUsersService.update.mockResolvedValueOnce(updatedUser1);
			mockUsersService.update.mockResolvedValueOnce(updatedUser2);

			const result1 = await controller.update(1, updateDto1);
			const result2 = await controller.update(2, updateDto2);

			expect(result1.firstName).toBe('Updated1');
			expect(result2.firstName).toBe('Updated2');
			expect(mockUsersService.update).toHaveBeenCalledTimes(2);
		});

		it('should pass exact parameters to service', async () => {
			const updateDto: UpdateUserDto = {
				address: 'New Address',
				phoneNumber: '+1111111111',
			};

			mockUsersService.update.mockResolvedValue(mockUser);

			await controller.update(7, updateDto);

			expect(mockUsersService.update).toHaveBeenCalledWith(7, updateDto);
		});
	});

	describe('removeById', () => {
		it('should remove a user successfully', async () => {
			mockUsersService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(1);

			expect(mockUsersService.removeById).toHaveBeenCalledWith(1);
			expect(mockUsersService.removeById).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined();
		});

		it('should return undefined after successful deletion', async () => {
			mockUsersService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(1);

			expect(result).toBeUndefined();
			expect(result).not.toBeDefined();
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			mockUsersService.removeById.mockRejectedValue(
				new UserNotFoundException(999),
			);

			await expect(controller.removeById(999)).rejects.toThrow(
				UserNotFoundException,
			);
			expect(mockUsersService.removeById).toHaveBeenCalledWith(999);
		});

		it('should remove multiple users sequentially', async () => {
			mockUsersService.removeById.mockResolvedValue(undefined);

			const result1 = await controller.removeById(1);
			const result2 = await controller.removeById(2);
			const result3 = await controller.removeById(3);

			expect(result1).toBeUndefined();
			expect(result2).toBeUndefined();
			expect(result3).toBeUndefined();
			expect(mockUsersService.removeById).toHaveBeenCalledTimes(3);
			expect(mockUsersService.removeById).toHaveBeenNthCalledWith(1, 1);
			expect(mockUsersService.removeById).toHaveBeenNthCalledWith(2, 2);
			expect(mockUsersService.removeById).toHaveBeenNthCalledWith(3, 3);
		});

		it('should pass exact ID parameter to service', async () => {
			mockUsersService.removeById.mockResolvedValue(undefined);

			await controller.removeById(45);

			expect(mockUsersService.removeById).toHaveBeenCalledWith(45);
		});

		it('should handle deletion of minimum valid ID', async () => {
			mockUsersService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(1);

			expect(result).toBeUndefined();
		});

		it('should handle deletion of large ID values', async () => {
			const largeId = 2147483647;
			mockUsersService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(largeId);

			expect(result).toBeUndefined();
			expect(mockUsersService.removeById).toHaveBeenCalledWith(largeId);
		});
	});

	describe('setUserRole', () => {
		it('should set user role successfully', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			mockUsersService.setUserRole.mockResolvedValue(undefined);

			const result = await controller.setUserRole(1, setUserRoleDto);

			expect(mockUsersService.setUserRole).toHaveBeenCalledWith(
				1,
				setUserRoleDto,
			);
			expect(mockUsersService.setUserRole).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined();
		});

		it('should return undefined after setting role', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			mockUsersService.setUserRole.mockResolvedValue(undefined);

			const result = await controller.setUserRole(1, setUserRoleDto);

			expect(result).toBeUndefined();
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			mockUsersService.setUserRole.mockRejectedValue(
				new UserNotFoundException(999),
			);

			await expect(
				controller.setUserRole(999, setUserRoleDto),
			).rejects.toThrow(UserNotFoundException);
		});

		it('should handle changing user role from user to admin', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			mockUsersService.setUserRole.mockResolvedValue(undefined);

			const result = await controller.setUserRole(1, setUserRoleDto);

			expect(mockUsersService.setUserRole).toHaveBeenCalledWith(1, {
				roleId: 2,
			});
			expect(result).toBeUndefined();
		});

		it('should change roles multiple times for same user', async () => {
			const roleIds = [2, 3, 4];

			for (const roleId of roleIds) {
				const setUserRoleDto: SetUserRoleDto = {
					roleId,
				};

				mockUsersService.setUserRole.mockResolvedValue(undefined);

				await controller.setUserRole(1, setUserRoleDto);

				expect(mockUsersService.setUserRole).toHaveBeenCalledWith(
					1,
					setUserRoleDto,
				);
			}

			expect(mockUsersService.setUserRole).toHaveBeenCalledTimes(3);
		});

		it('should pass exact parameters to service', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 5,
			};

			mockUsersService.setUserRole.mockResolvedValue(undefined);

			await controller.setUserRole(10, setUserRoleDto);

			expect(mockUsersService.setUserRole).toHaveBeenCalledWith(
				10,
				setUserRoleDto,
			);
		});

		it('should handle setting role multiple times', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			mockUsersService.setUserRole.mockResolvedValue(undefined);

			await controller.setUserRole(1, setUserRoleDto);
			await controller.setUserRole(1, setUserRoleDto);

			expect(mockUsersService.setUserRole).toHaveBeenCalledTimes(2);
		});
	});

	describe('integration scenarios', () => {
		it('should handle create and then find the created user', async () => {
			const createDto: CreateUserDto = {
				email: 'new@example.com',
				firstName: 'New',
				lastName: 'User',
				password: 'password',
				phoneNumber: '+1234567890',
				address: 'Address',
				profilePicture: 'pic.jpg',
			};

			const newUser: User = {
				id: 3,
				email: 'new@example.com',
				firstName: 'New',
				lastName: 'User',
				password: 'hashed',
				phoneNumber: '+1234567890',
				address: 'Address',
				isDeleted: false,
				profilePicture: 'pic.jpg',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: new Date(),
				role: mockRole,
			};

			mockUsersService.create.mockResolvedValue(newUser);
			mockUsersService.findOne.mockResolvedValue(newUser);

			const createdResult = await controller.create(createDto);
			const foundResult = await controller.findOne(createdResult.id);

			expect(createdResult).toEqual(newUser);
			expect(foundResult).toEqual(newUser);
		});

		it('should handle create, set role, update, and remove flow', async () => {
			const createDto: CreateUserDto = {
				email: 'flow@example.com',
				firstName: 'Flow',
				lastName: 'User',
				password: 'password',
				phoneNumber: '+1234567890',
				address: 'Address',
				profilePicture: 'pic.jpg',
			};

			const createdUser: User = {
				id: 4,
				email: 'flow@example.com',
				firstName: 'Flow',
				lastName: 'User',
				password: 'hashed',
				phoneNumber: '+1234567890',
				address: 'Address',
				isDeleted: false,
				profilePicture: 'pic.jpg',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: new Date(),
				role: mockRole,
			};

			const updatedUser: User = {
				...createdUser,
				firstName: 'FlowUpdated',
			};

			mockUsersService.create.mockResolvedValue(createdUser);
			mockUsersService.setUserRole.mockResolvedValue(undefined);
			mockUsersService.update.mockResolvedValue(updatedUser);
			mockUsersService.removeById.mockResolvedValue(undefined);

			const created = await controller.create(createDto);
			expect(created.email).toBe('flow@example.com');

			await controller.setUserRole(created.id, { roleId: 2 });

			const updateDto: UpdateUserDto = {
				firstName: 'FlowUpdated',
			};

			const updated = await controller.update(created.id, updateDto);
			expect(updated.firstName).toBe('FlowUpdated');

			const removed = await controller.removeById(updated.id);
			expect(removed).toBeUndefined();
		});

		it('should verify service is called exactly once per request', async () => {
			mockUsersService.findOne.mockResolvedValue(mockUser);

			await controller.findOne(1);
			await controller.findOne(1);

			expect(mockUsersService.findOne).toHaveBeenCalledTimes(2);
		});

		it('should handle consecutive create operations', async () => {
			const createDto1: CreateUserDto = {
				email: 'user1@example.com',
				firstName: 'User',
				lastName: 'One',
				password: 'password1',
				phoneNumber: '+1111111111',
				address: 'Address 1',
				profilePicture: 'pic1.jpg',
			};

			const createDto2: CreateUserDto = {
				email: 'user2@example.com',
				firstName: 'User',
				lastName: 'Two',
				password: 'password2',
				phoneNumber: '+2222222222',
				address: 'Address 2',
				profilePicture: 'pic2.jpg',
			};

			const user1: User = {
				id: 10,
				email: 'user1@example.com',
				firstName: 'User',
				lastName: 'One',
				password: 'hashed',
				phoneNumber: '+1111111111',
				address: 'Address 1',
				isDeleted: false,
				profilePicture: 'pic1.jpg',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: new Date(),
				role: mockRole,
			};

			const user2: User = {
				id: 11,
				email: 'user2@example.com',
				firstName: 'User',
				lastName: 'Two',
				password: 'hashed',
				phoneNumber: '+2222222222',
				address: 'Address 2',
				isDeleted: false,
				profilePicture: 'pic2.jpg',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: new Date(),
				role: mockRole,
			};

			mockUsersService.create.mockResolvedValueOnce(user1);
			mockUsersService.create.mockResolvedValueOnce(user2);

			const result1 = await controller.create(createDto1);
			const result2 = await controller.create(createDto2);

			expect(result1.email).toBe('user1@example.com');
			expect(result2.email).toBe('user2@example.com');
			expect(mockUsersService.create).toHaveBeenCalledTimes(2);
		});
	});

	describe('error handling and exception branches', () => {
		it('should propagate error from create', async () => {
			const createDto: CreateUserDto = {
				email: 'error@example.com',
				firstName: 'Error',
				lastName: 'User',
				password: 'password',
				phoneNumber: '+1234567890',
				address: 'Address',
				profilePicture: 'pic.jpg',
			};

			const error = new Error('Database connection failed');
			mockUsersService.create.mockRejectedValue(error);

			await expect(controller.create(createDto)).rejects.toThrow(
				'Database connection failed',
			);
		});

		it('should propagate error from findAll', async () => {
			const error = new Error('Database query error');
			mockUsersService.findAll.mockRejectedValue(error);

			await expect(controller.findAll()).rejects.toThrow(
				'Database query error',
			);
		});

		it('should propagate error from findOne', async () => {
			const error = new Error('Database connection error');
			mockUsersService.findOne.mockRejectedValue(error);

			await expect(controller.findOne(1)).rejects.toThrow(
				'Database connection error',
			);
		});

		it('should propagate error from update', async () => {
			const updateDto: UpdateUserDto = {
				firstName: 'Fail',
			};

			const error = new Error('Update failed');
			mockUsersService.update.mockRejectedValue(error);

			await expect(controller.update(1, updateDto)).rejects.toThrow(
				'Update failed',
			);
		});

		it('should propagate error from removeById', async () => {
			const error = new Error('Delete failed');
			mockUsersService.removeById.mockRejectedValue(error);

			await expect(controller.removeById(1)).rejects.toThrow(
				'Delete failed',
			);
		});

		it('should propagate error from setUserRole', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 1,
			};

			const error = new Error('Role assignment failed');
			mockUsersService.setUserRole.mockRejectedValue(error);

			await expect(controller.setUserRole(1, setUserRoleDto)).rejects.toThrow(
				'Role assignment failed',
			);
		});
	});
});