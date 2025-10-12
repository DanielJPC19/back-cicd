import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { RolesService } from '../roles/roles.service';
import { UserConflict, UserNotFoundException } from '../../../common/exceptions';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SetUserRoleDto } from '../dto/update-user-role.dto';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
	let service: UsersService;
	let mockUserRepository: {
		exists: jest.Mock;
		create: jest.Mock;
		save: jest.Mock;
		findOne: jest.Mock;
		findOneBy: jest.Mock;
		update: jest.Mock;
		softDelete: jest.Mock;
		find: jest.Mock;
	};
	let mockRolesService: {
		findByName: jest.Mock;
		findOne: jest.Mock;
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
		mockUserRepository = {
			exists: jest.fn(),
			create: jest.fn(),
			save: jest.fn(),
			findOne: jest.fn(),
			findOneBy: jest.fn(),
			update: jest.fn(),
			softDelete: jest.fn(),
			find: jest.fn(),
		};

		mockRolesService = {
			findByName: jest.fn(),
			findOne: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepository,
				},
				{
					provide: RolesService,
					useValue: mockRolesService,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('should be defined', () => {
		it('should be defined', () => {
			expect(service).toBeDefined();
		});
	});

	describe('create', () => {
		it('should create a new user successfully', async () => {
			const createDto: CreateUserDto = {
				email: 'user@example.com',
				firstName: 'John',
				lastName: 'Doe',
				password: 'plain_password',
				phoneNumber: '+1234567890',
				address: '123 Main St',
				profilePicture: 'profile.jpg',
			};

			const hashedPassword = 'hashed_password_123';
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

			mockUserRepository.exists.mockResolvedValue(false);
			mockRolesService.findByName.mockResolvedValue(mockRole);
			mockUserRepository.create.mockReturnValue(mockUser);
			mockUserRepository.save.mockResolvedValue(mockUser);

			const result = await service.create(createDto);

			expect(mockUserRepository.exists).toHaveBeenCalledWith({
				where: { email: 'user@example.com' },
			});
			expect(bcrypt.hash).toHaveBeenCalledWith('plain_password', 10);
			expect(mockRolesService.findByName).toHaveBeenCalledWith('user');
			expect(mockUserRepository.create).toHaveBeenCalled();
			expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
			expect(result).toEqual(mockUser);
		});

		it('should throw UserConflict when email already exists', async () => {
			const createDto: CreateUserDto = {
				email: 'user@example.com',
				firstName: 'John',
				lastName: 'Doe',
				password: 'plain_password',
				phoneNumber: '+1234567890',
				address: '123 Main St',
				profilePicture: 'profile.jpg',
			};

			mockUserRepository.exists.mockResolvedValue(true);

			await expect(service.create(createDto)).rejects.toThrow(
				UserConflict,
			);
			expect(mockUserRepository.exists).toHaveBeenCalledWith({
				where: { email: 'user@example.com' },
			});
			expect(bcrypt.hash).not.toHaveBeenCalled();
		});

		it('should hash password before saving', async () => {
			const createDto: CreateUserDto = {
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				password: 'plain_password_123',
				phoneNumber: '+1234567890',
				address: 'Test address',
				profilePicture: 'test.jpg',
			};

			const hashedPassword = 'hashed_password_xyz';
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

			mockUserRepository.exists.mockResolvedValue(false);
			mockRolesService.findByName.mockResolvedValue(mockRole);
			mockUserRepository.create.mockReturnValue(mockUser);
			mockUserRepository.save.mockResolvedValue(mockUser);

			await service.create(createDto);

			expect(bcrypt.hash).toHaveBeenCalledWith('plain_password_123', 10);
		});

		it('should assign default user role to new user', async () => {
			const createDto: CreateUserDto = {
				email: 'newuser@example.com',
				firstName: 'New',
				lastName: 'User',
				password: 'password',
				phoneNumber: '+1234567890',
				address: 'Address',
				profilePicture: 'pic.jpg',
			};

			(bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
			mockUserRepository.exists.mockResolvedValue(false);
			mockRolesService.findByName.mockResolvedValue(mockRole);
			mockUserRepository.create.mockReturnValue(mockUser);
			mockUserRepository.save.mockResolvedValue(mockUser);

			await service.create(createDto);

			expect(mockRolesService.findByName).toHaveBeenCalledWith('user');
		});

		it('should handle special characters in email', async () => {
			const createDto: CreateUserDto = {
				email: 'user+special@example.co.uk',
				firstName: 'John',
				lastName: 'Doe',
				password: 'password',
				phoneNumber: '+1234567890',
				address: 'Address',
				profilePicture: 'pic.jpg',
			};

			(bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
			mockUserRepository.exists.mockResolvedValue(false);
			mockRolesService.findByName.mockResolvedValue(mockRole);
			mockUserRepository.create.mockReturnValue(mockUser);
			mockUserRepository.save.mockResolvedValue(mockUser);

			await service.create(createDto);

			expect(mockUserRepository.exists).toHaveBeenCalledWith({
				where: { email: 'user+special@example.co.uk' },
			});
		});
	});

	describe('findByEmail', () => {
		it('should find user by email successfully', async () => {
			mockUserRepository.findOne.mockResolvedValue(mockUser);

			const result = await service.findByEmail('user@example.com');

			expect(mockUserRepository.findOne).toHaveBeenCalledWith({
				where: { email: 'user@example.com' },
				relations: ['role', 'role.permissions'],
			});
			expect(result).toEqual(mockUser);
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			mockUserRepository.findOne.mockResolvedValue(null);

			await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
				UserNotFoundException,
			);
		});

		it('should load user with role and permissions', async () => {
			const userWithPermissions: User = {
				...mockUser,
				role: {
					...mockRole,
					permissions: [mockPermission],
				},
			};

			mockUserRepository.findOne.mockResolvedValue(userWithPermissions);

			const result = await service.findByEmail('user@example.com');

			expect(result.role.permissions).toHaveLength(1);
			expect(result.role.permissions[0].permissionName).toBe('CREATE_USER');
		});

		it('should handle case sensitivity in email', async () => {
			mockUserRepository.findOne.mockResolvedValue(null);

			await expect(service.findByEmail('USER@EXAMPLE.COM')).rejects.toThrow(
				UserNotFoundException,
			);
		});
	});

	describe('findOne', () => {
		it('should find user by id successfully', async () => {
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.findOne(1);

			expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(result).toEqual(mockUser);
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			mockUserRepository.findOneBy.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				UserNotFoundException,
			);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
		});

		it('should work with different valid IDs', async () => {
			const testIds = [1, 5, 100, 9999];

			for (const id of testIds) {
				const userWithId: User = {
					...mockUser,
					id,
				};
				mockUserRepository.findOneBy.mockResolvedValue(userWithId);

				const result = await service.findOne(id);

				expect(result.id).toBe(id);
			}
		});

		it('should return user with all properties', async () => {
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.findOne(1);

			expect(result.id).toBe(1);
			expect(result.email).toBe('user@example.com');
			expect(result.firstName).toBe('John');
			expect(result.lastName).toBe('Doe');
			expect(result.role).toBeDefined();
		});
	});

	describe('update', () => {
		it('should update user successfully', async () => {
			const updateDto: UpdateUserDto = {
				firstName: 'Johnny',
				lastName: 'Smith',
			};

			const updatedUser: User = {
				...mockUser,
				firstName: 'Johnny',
				lastName: 'Smith',
			};

			mockUserRepository.update.mockResolvedValue({ affected: 1 });
			mockUserRepository.findOneBy.mockResolvedValue(updatedUser);

			const result = await service.update(1, updateDto);

			expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateDto);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(result).toEqual(updatedUser);
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			const updateDto: UpdateUserDto = {
				firstName: 'Johnny',
			};

			mockUserRepository.update.mockResolvedValue({ affected: 0 });

			await expect(service.update(999, updateDto)).rejects.toThrow(
				UserNotFoundException,
			);
		});

		it('should update only provided fields', async () => {
			const updateDto: UpdateUserDto = {
				phoneNumber: '+9999999999',
			};

			mockUserRepository.update.mockResolvedValue({ affected: 1 });
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			await service.update(1, updateDto);

			expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateDto);
		});

		it('should handle update with multiple fields', async () => {
			const updateDto: UpdateUserDto = {
				firstName: 'New',
				lastName: 'Name',
				phoneNumber: '+1111111111',
				address: 'New Address',
			};

			mockUserRepository.update.mockResolvedValue({ affected: 1 });
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			await service.update(1, updateDto);

			expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateDto);
		});
	});

	describe('removeById', () => {
		it('should soft delete user successfully', async () => {
			mockUserRepository.softDelete.mockResolvedValue({ affected: 1 });

			await service.removeById(1);

			expect(mockUserRepository.softDelete).toHaveBeenCalledWith({ id: 1 });
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			mockUserRepository.softDelete.mockResolvedValue({ affected: 0 });

			await expect(service.removeById(999)).rejects.toThrow(
				UserNotFoundException,
			);
		});

		it('should return void successfully', async () => {
			mockUserRepository.softDelete.mockResolvedValue({ affected: 1 });

			const result = await service.removeById(1);

			expect(result).toBeUndefined();
		});

		it('should handle multiple delete attempts', async () => {
			const idsToDelete = [1, 2, 3];

			for (const id of idsToDelete) {
				mockUserRepository.softDelete.mockResolvedValue({ affected: 1 });
				await service.removeById(id);
				expect(mockUserRepository.softDelete).toHaveBeenCalledWith({ id });
			}
		});
	});

	describe('setUserRole', () => {
		it('should set user role successfully', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			const adminRole: Role = {
				...mockRole,
				id: 2,
				roleName: 'admin',
			};

			mockUserRepository.findOneBy.mockResolvedValue(mockUser);
			mockRolesService.findOne.mockResolvedValue(adminRole);
			mockUserRepository.save.mockResolvedValue({
				...mockUser,
				role: adminRole,
			});

			await service.setUserRole(1, setUserRoleDto);

			expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(mockRolesService.findOne).toHaveBeenCalledWith(2);
			expect(mockUserRepository.save).toHaveBeenCalled();
		});

		it('should throw UserNotFoundException when user does not exist', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			mockUserRepository.findOneBy.mockResolvedValue(null);

			await expect(service.setUserRole(999, setUserRoleDto)).rejects.toThrow(
				UserNotFoundException,
			);
		});

		it('should change user role from user to admin', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			const adminRole: Role = {
				...mockRole,
				id: 2,
				roleName: 'admin',
			};

			mockUserRepository.findOneBy.mockResolvedValue(mockUser);
			mockRolesService.findOne.mockResolvedValue(adminRole);
			mockUserRepository.save.mockResolvedValue({
				...mockUser,
				role: adminRole,
			});

			await service.setUserRole(1, setUserRoleDto);

			expect(mockUserRepository.save).toHaveBeenCalled();
		});

		it('should return void after setting role', async () => {
			const setUserRoleDto: SetUserRoleDto = {
				roleId: 2,
			};

			mockUserRepository.findOneBy.mockResolvedValue(mockUser);
			mockRolesService.findOne.mockResolvedValue(mockRole);
			mockUserRepository.save.mockResolvedValue(mockUser);

			const result = await service.setUserRole(1, setUserRoleDto);

			expect(result).toBeUndefined();
		});

		it('should handle multiple role changes', async () => {
			const roleIds = [2, 3, 4];

			for (const roleId of roleIds) {
				const setUserRoleDto: SetUserRoleDto = {
					roleId,
				};

				const role: Role = {
					...mockRole,
					id: roleId,
				};

				mockUserRepository.findOneBy.mockResolvedValue(mockUser);
				mockRolesService.findOne.mockResolvedValue(role);
				mockUserRepository.save.mockResolvedValue({
					...mockUser,
					role,
				});

				await service.setUserRole(1, setUserRoleDto);

				expect(mockRolesService.findOne).toHaveBeenCalledWith(roleId);
			}
		});
	});

	describe('findAll', () => {
		it('should return all users', async () => {
			const users: User[] = [mockUser, mockUser2];
			mockUserRepository.find.mockResolvedValue(users);

			const result = await service.findAll();

			expect(mockUserRepository.find).toHaveBeenCalled();
			expect(result).toEqual(users);
			expect(result.length).toBe(2);
		});

		it('should return empty array when no users exist', async () => {
			mockUserRepository.find.mockResolvedValue([]);

			const result = await service.findAll();

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

			mockUserRepository.find.mockResolvedValue(usersWithRoles);

			const result = await service.findAll();

			expect(result[0].role).toBeDefined();
			expect(result[1].role).toBeDefined();
		});
	});

	describe('edge cases and integration scenarios', () => {
		it('should handle rapid consecutive creates with different emails', async () => {
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

			(bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
			mockUserRepository.exists.mockResolvedValue(false);
			mockRolesService.findByName.mockResolvedValue(mockRole);
			mockUserRepository.create.mockReturnValue(mockUser);
			mockUserRepository.save.mockResolvedValueOnce(mockUser);
			mockUserRepository.save.mockResolvedValueOnce(mockUser2);

			await service.create(createDto1);
			await service.create(createDto2);

			expect(bcrypt.hash).toHaveBeenCalledTimes(2);
		});

		it('should maintain consistency in find operations', async () => {
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);
			mockUserRepository.findOne.mockResolvedValue(mockUser);

			const resultById = await service.findOne(1);
			const resultByEmail = await service.findByEmail('user@example.com');

			expect(resultById).toEqual(resultByEmail);
		});

		it('should handle create, set role, and update flow', async () => {
			const createDto: CreateUserDto = {
				email: 'flow@example.com',
				firstName: 'Flow',
				lastName: 'User',
				password: 'password',
				phoneNumber: '+1234567890',
				address: 'Address',
				profilePicture: 'pic.jpg',
			};

			const newUser: User = {
				...mockUser,
				email: 'flow@example.com',
			};

			const adminRole: Role = {
				...mockRole,
				id: 2,
				roleName: 'admin',
			};

			(bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
			mockUserRepository.exists.mockResolvedValue(false);
			mockRolesService.findByName.mockResolvedValue(mockRole);
			mockUserRepository.create.mockReturnValue(newUser);
			mockUserRepository.save.mockResolvedValueOnce(newUser);

			const created = await service.create(createDto);
			expect(created.email).toBe('flow@example.com');

			mockUserRepository.findOneBy.mockResolvedValue(newUser);
			mockRolesService.findOne.mockResolvedValue(adminRole);
			mockUserRepository.save.mockResolvedValueOnce({
				...newUser,
				role: adminRole,
			});

			await service.setUserRole(created.id, { roleId: 2 });
			expect(mockRolesService.findOne).toHaveBeenCalledWith(2);

			const updateDto: UpdateUserDto = {
				firstName: 'FlowUpdated',
			};

			mockUserRepository.update.mockResolvedValue({ affected: 1 });
			mockUserRepository.findOneBy.mockResolvedValue({
				...newUser,
				firstName: 'FlowUpdated',
			});

			await service.update(created.id, updateDto);
			expect(mockUserRepository.update).toHaveBeenCalled();
		});
	});
});