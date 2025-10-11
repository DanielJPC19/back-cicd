import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AddPermissionDto } from '../dto/add-permissionToRole.dto';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RoleNotFoundException, PermissionNotFoundException } from '../../../common/exceptions';
import { RoleConflict } from '../../../common/exceptions/role-conflict.exception';

describe('RolesController', () => {
	let controller: RolesController;
	let mockRolesService: {
		create: jest.Mock;
		findOne: jest.Mock;
		update: jest.Mock;
		removeById: jest.Mock;
		addPermission: jest.Mock;
	};

	const mockPermission: Permission = {
		id: 1,
		permissionName: 'CREATE_USER',
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
	};

	const mockPermission2: Permission = {
		id: 2,
		permissionName: 'DELETE_USER',
		createdAt: new Date('2025-01-02'),
		updatedAt: new Date('2025-01-02'),
	};

	const mockRole: Role = {
		id: 1,
		roleName: 'ADMIN',
		description: 'Administrator role',
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
		permissions: [mockPermission],
		users: [],
	};

	const mockRole2: Role = {
		id: 2,
		roleName: 'USER',
		description: 'User role',
		createdAt: new Date('2025-01-02'),
		updatedAt: new Date('2025-01-02'),
		permissions: [mockPermission2],
		users: [],
	};

	beforeEach(async () => {
		mockRolesService = {
			create: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			removeById: jest.fn(),
			addPermission: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [RolesController],
			providers: [
				{
					provide: RolesService,
					useValue: mockRolesService,
				},
			],
		})
			.overrideGuard('AuthGuard')
			.useValue({})
			.overrideGuard('PermissionsGuard')
			.useValue({})
			.compile();

		controller = module.get<RolesController>(RolesController);
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
		it('should create a new role successfully', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'ADMIN',
				description: 'Administrator role',
			};

			mockRolesService.create.mockResolvedValue(mockRole);

			const result = await controller.create(createDto);

			expect(mockRolesService.create).toHaveBeenCalledWith(createDto);
			expect(mockRolesService.create).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockRole);
			expect(result.id).toBe(1);
			expect(result.roleName).toBe('ADMIN');
		});

		it('should return created role with all properties', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'MODERATOR',
				description: 'Moderator role',
			};

			const createdRole: Role = {
				id: 5,
				roleName: 'MODERATOR',
				description: 'Moderator role',
				createdAt: new Date('2025-01-05'),
				updatedAt: new Date('2025-01-05'),
				permissions: [],
				users: [],
			};

			mockRolesService.create.mockResolvedValue(createdRole);

			const result = await controller.create(createDto);

			expect(result).toEqual(createdRole);
			expect(result.createdAt).toEqual(new Date('2025-01-05'));
			expect(result.updatedAt).toEqual(new Date('2025-01-05'));
		});

		it('should throw RoleConflict when role already exists', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'ADMIN',
				description: 'Administrator role',
			};

			mockRolesService.create.mockRejectedValue(
				new RoleConflict('ADMIN'),
			);

			await expect(controller.create(createDto)).rejects.toThrow(
				RoleConflict,
			);
			expect(mockRolesService.create).toHaveBeenCalledWith(createDto);
		});

		it('should handle special characters in role name during creation', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'ADMIN-ROLE_WITH.CHARS',
				description: 'Special characters role',
			};

			const specialRole: Role = {
				...mockRole,
				roleName: createDto.roleName,
				description: createDto.description,
			};

			mockRolesService.create.mockResolvedValue(specialRole);

			const result = await controller.create(createDto);

			expect(result.roleName).toBe('ADMIN-ROLE_WITH.CHARS');
		});

		it('should handle different role names', async () => {
			const names = ['ADMIN', 'USER', 'MODERATOR'];

			for (const name of names) {
				const createDto: CreateRoleDto = {
					roleName: name,
					description: `${name} role`,
				};

				const role: Role = {
					id: Math.random(),
					roleName: name,
					description: `${name} role`,
					createdAt: new Date(),
					updatedAt: new Date(),
					permissions: [],
					users: [],
				};

				mockRolesService.create.mockResolvedValue(role);

				const result = await controller.create(createDto);

				expect(result.roleName).toBe(name);
			}
		});

		it('should pass DTO exactly to service without modification', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'EXACT_DTO_TEST',
				description: 'Test description',
			};

			mockRolesService.create.mockResolvedValue(mockRole);

			await controller.create(createDto);

			expect(mockRolesService.create).toHaveBeenCalledWith(
				expect.objectContaining({
					roleName: 'EXACT_DTO_TEST',
					description: 'Test description',
				}),
			);
		});
	});

	describe('findOne', () => {
		it('should find a role by id successfully', async () => {
			mockRolesService.findOne.mockResolvedValue(mockRole);

			const result = await controller.findOne(1);

			expect(mockRolesService.findOne).toHaveBeenCalledWith(1);
			expect(mockRolesService.findOne).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockRole);
			expect(result.id).toBe(1);
		});

		it('should return role with all properties intact', async () => {
			const role: Role = {
				id: 42,
				roleName: 'FULL_ROLE',
				description: 'Full role with permissions',
				createdAt: new Date('2025-01-10'),
				updatedAt: new Date('2025-01-11'),
				permissions: [mockPermission, mockPermission2],
				users: [],
			};

			mockRolesService.findOne.mockResolvedValue(role);

			const result = await controller.findOne(42);

			expect(result).toEqual(role);
			expect(result.id).toBe(42);
			expect(result.roleName).toBe('FULL_ROLE');
			expect(result.permissions.length).toBe(2);
		});

		it('should throw RoleNotFoundException when role does not exist', async () => {
			mockRolesService.findOne.mockRejectedValue(
				new RoleNotFoundException(999),
			);

			await expect(controller.findOne(999)).rejects.toThrow(
				RoleNotFoundException,
			);
			expect(mockRolesService.findOne).toHaveBeenCalledWith(999);
		});

		it('should find different roles by id', async () => {
			mockRolesService.findOne.mockResolvedValue(mockRole2);

			const result = await controller.findOne(2);

			expect(result).toEqual(mockRole2);
			expect(result.roleName).toBe('USER');
		});

		it('should work with various valid IDs', async () => {
			const testIds = [1, 5, 100, 9999];

			for (const id of testIds) {
				const roleWithId: Role = {
					...mockRole,
					id,
				};
				mockRolesService.findOne.mockResolvedValue(roleWithId);

				const result = await controller.findOne(id);

				expect(result.id).toBe(id);
				expect(mockRolesService.findOne).toHaveBeenCalledWith(id);
			}
		});

		it('should call service exactly once per request', async () => {
			mockRolesService.findOne.mockResolvedValue(mockRole);

			await controller.findOne(1);

			expect(mockRolesService.findOne).toHaveBeenCalledTimes(1);
		});

		it('should handle minimum valid ID (1)', async () => {
			mockRolesService.findOne.mockResolvedValue(mockRole);

			const result = await controller.findOne(1);

			expect(result).toEqual(mockRole);
		});

		it('should handle large ID values', async () => {
			const largeId = 2147483647;
			const roleWithLargeId: Role = {
				...mockRole,
				id: largeId,
			};

			mockRolesService.findOne.mockResolvedValue(roleWithLargeId);

			const result = await controller.findOne(largeId);

			expect(result.id).toBe(largeId);
		});
	});

	describe('update', () => {
		it('should update a role successfully', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'SUPER_ADMIN',
				description: 'Super Administrator',
			};

			const updatedRole: Role = {
				...mockRole,
				roleName: 'SUPER_ADMIN',
				description: 'Super Administrator',
			};

			mockRolesService.update.mockResolvedValue(updatedRole);

			const result = await controller.update(1, updateDto);

			expect(mockRolesService.update).toHaveBeenCalledWith(1, updateDto);
			expect(mockRolesService.update).toHaveBeenCalledTimes(1);
			expect(result).toEqual(updatedRole);
			expect(result.roleName).toBe('SUPER_ADMIN');
		});

		it('should return updated role with all properties', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'UPDATED_ROLE',
				description: 'Updated description',
			};

			const updatedRole: Role = {
				id: 3,
				roleName: 'UPDATED_ROLE',
				description: 'Updated description',
				createdAt: new Date('2025-01-01'),
				updatedAt: new Date('2025-01-15'),
				permissions: [mockPermission],
				users: [],
			};

			mockRolesService.update.mockResolvedValue(updatedRole);

			const result = await controller.update(3, updateDto);

			expect(result).toEqual(updatedRole);
			expect(result.id).toBe(3);
			expect(result.updatedAt).toEqual(new Date('2025-01-15'));
		});

		it('should throw RoleConflict when new role name already exists', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'EXISTING_ROLE',
				description: 'Existing role',
			};

			mockRolesService.update.mockRejectedValue(
				new RoleConflict('EXISTING_ROLE'),
			);

			await expect(controller.update(1, updateDto)).rejects.toThrow(
				RoleConflict,
			);
			expect(mockRolesService.update).toHaveBeenCalledWith(1, updateDto);
		});

		it('should throw RoleNotFoundException when role to update does not exist', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'NEW_ROLE',
				description: 'New role',
			};

			mockRolesService.update.mockRejectedValue(
				new RoleNotFoundException(999),
			);

			await expect(controller.update(999, updateDto)).rejects.toThrow(
				RoleNotFoundException,
			);
			expect(mockRolesService.update).toHaveBeenCalledWith(999, updateDto);
		});

		it('should handle update with same role name (no conflict)', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'ADMIN',
				description: 'Updated description',
			};

			mockRolesService.update.mockResolvedValue(mockRole);

			const result = await controller.update(1, updateDto);

			expect(result).toEqual(mockRole);
		});

		it('should update multiple roles sequentially', async () => {
			const updateDto1: UpdateRoleDto = {
				roleName: 'UPDATED_ROLE_1',
				description: 'Updated role 1',
			};
			const updateDto2: UpdateRoleDto = {
				roleName: 'UPDATED_ROLE_2',
				description: 'Updated role 2',
			};

			const updatedRole1: Role = {
				...mockRole,
				id: 1,
				roleName: 'UPDATED_ROLE_1',
			};
			const updatedRole2: Role = {
				...mockRole2,
				id: 2,
				roleName: 'UPDATED_ROLE_2',
			};

			mockRolesService.update.mockResolvedValueOnce(updatedRole1);
			mockRolesService.update.mockResolvedValueOnce(updatedRole2);

			const result1 = await controller.update(1, updateDto1);
			const result2 = await controller.update(2, updateDto2);

			expect(result1.roleName).toBe('UPDATED_ROLE_1');
			expect(result2.roleName).toBe('UPDATED_ROLE_2');
			expect(mockRolesService.update).toHaveBeenCalledTimes(2);
		});

		it('should pass exact parameters to service', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'EXACT_PARAMS',
				description: 'Exact params test',
			};

			mockRolesService.update.mockResolvedValue(mockRole);

			await controller.update(7, updateDto);

			expect(mockRolesService.update).toHaveBeenCalledWith(7, updateDto);
		});
	});

	describe('removeById', () => {
		it('should remove a role successfully', async () => {
			mockRolesService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(1);

			expect(mockRolesService.removeById).toHaveBeenCalledWith(1);
			expect(mockRolesService.removeById).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined();
		});

		it('should return undefined after successful deletion', async () => {
			mockRolesService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(1);

			expect(result).toBeUndefined();
			expect(result).not.toBeDefined();
		});

		it('should throw RoleNotFoundException when role does not exist', async () => {
			mockRolesService.removeById.mockRejectedValue(
				new RoleNotFoundException(999),
			);

			await expect(controller.removeById(999)).rejects.toThrow(
				RoleNotFoundException,
			);
			expect(mockRolesService.removeById).toHaveBeenCalledWith(999);
		});

		it('should remove multiple roles sequentially', async () => {
			mockRolesService.removeById.mockResolvedValue(undefined);

			const result1 = await controller.removeById(1);
			const result2 = await controller.removeById(2);
			const result3 = await controller.removeById(3);

			expect(result1).toBeUndefined();
			expect(result2).toBeUndefined();
			expect(result3).toBeUndefined();
			expect(mockRolesService.removeById).toHaveBeenCalledTimes(3);
			expect(mockRolesService.removeById).toHaveBeenNthCalledWith(1, 1);
			expect(mockRolesService.removeById).toHaveBeenNthCalledWith(2, 2);
			expect(mockRolesService.removeById).toHaveBeenNthCalledWith(3, 3);
		});

		it('should pass exact ID parameter to service', async () => {
			mockRolesService.removeById.mockResolvedValue(undefined);

			await controller.removeById(45);

			expect(mockRolesService.removeById).toHaveBeenCalledWith(45);
		});

		it('should handle deletion of minimum valid ID', async () => {
			mockRolesService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(1);

			expect(result).toBeUndefined();
		});

		it('should handle deletion of large ID values', async () => {
			const largeId = 2147483647;
			mockRolesService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(largeId);

			expect(result).toBeUndefined();
			expect(mockRolesService.removeById).toHaveBeenCalledWith(largeId);
		});
	});

	describe('addPermission', () => {
		it('should add permission to role successfully', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 2,
			};

			mockRolesService.addPermission.mockResolvedValue(undefined);

			const result = await controller.addPermission(addPermissionDto);

			expect(mockRolesService.addPermission).toHaveBeenCalledWith(
				addPermissionDto,
			);
			expect(mockRolesService.addPermission).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined();
		});

		it('should return undefined after adding permission', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 1,
			};

			mockRolesService.addPermission.mockResolvedValue(undefined);

			const result = await controller.addPermission(addPermissionDto);

			expect(result).toBeUndefined();
		});

		it('should throw RoleNotFoundException when role does not exist', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 999,
				permissionId: 1,
			};

			mockRolesService.addPermission.mockRejectedValue(
				new RoleNotFoundException(999),
			);

			await expect(controller.addPermission(addPermissionDto)).rejects.toThrow(
				RoleNotFoundException,
			);
		});

		it('should throw PermissionNotFoundException when permission does not exist', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 999,
			};

			mockRolesService.addPermission.mockRejectedValue(
				new PermissionNotFoundException(999),
			);

			await expect(controller.addPermission(addPermissionDto)).rejects.toThrow(
				PermissionNotFoundException,
			);
		});

		it('should add multiple permissions to role', async () => {
			const addPermissionDto1: AddPermissionDto = {
				roleId: 1,
				permissionId: 1,
			};

			const addPermissionDto2: AddPermissionDto = {
				roleId: 1,
				permissionId: 2,
			};

			mockRolesService.addPermission.mockResolvedValue(undefined);

			await controller.addPermission(addPermissionDto1);
			await controller.addPermission(addPermissionDto2);

			expect(mockRolesService.addPermission).toHaveBeenCalledTimes(2);
		});

		it('should pass exact parameters to service', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 5,
				permissionId: 3,
			};

			mockRolesService.addPermission.mockResolvedValue(undefined);

			await controller.addPermission(addPermissionDto);

			expect(mockRolesService.addPermission).toHaveBeenCalledWith(
				expect.objectContaining({
					roleId: 5,
					permissionId: 3,
				}),
			);
		});

		it('should handle adding same permission multiple times (idempotent)', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 1,
			};

			mockRolesService.addPermission.mockResolvedValue(undefined);

			await controller.addPermission(addPermissionDto);
			await controller.addPermission(addPermissionDto);

			expect(mockRolesService.addPermission).toHaveBeenCalledTimes(2);
		});
	});

	describe('integration scenarios', () => {
		it('should handle create and then find the created role', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'NEW_ROLE',
				description: 'New role',
			};

			const newRole: Role = {
				id: 3,
				roleName: 'NEW_ROLE',
				description: 'New role',
				createdAt: new Date(),
				updatedAt: new Date(),
				permissions: [],
				users: [],
			};

			mockRolesService.create.mockResolvedValue(newRole);
			mockRolesService.findOne.mockResolvedValue(newRole);

			const createdResult = await controller.create(createDto);
			const foundResult = await controller.findOne(createdResult.id);

			expect(createdResult).toEqual(newRole);
			expect(foundResult).toEqual(newRole);
			expect(mockRolesService.create).toHaveBeenCalledWith(createDto);
			expect(mockRolesService.findOne).toHaveBeenCalledWith(3);
		});

		it('should handle create, add permission, update, and remove flow', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'FLOW_ROLE',
				description: 'Flow role',
			};

			const createdRole: Role = {
				id: 4,
				roleName: 'FLOW_ROLE',
				description: 'Flow role',
				createdAt: new Date(),
				updatedAt: new Date(),
				permissions: [],
				users: [],
			};

			const roleWithPermission: Role = {
				...createdRole,
				permissions: [mockPermission],
			};

			const updatedRole: Role = {
				...roleWithPermission,
				description: 'Updated flow role',
			};

			mockRolesService.create.mockResolvedValue(createdRole);
			mockRolesService.addPermission.mockResolvedValue(undefined);
			mockRolesService.update.mockResolvedValue(updatedRole);
			mockRolesService.removeById.mockResolvedValue(undefined);

			const created = await controller.create(createDto);
			expect(created.roleName).toBe('FLOW_ROLE');

			const addPermissionDto: AddPermissionDto = {
				roleId: created.id,
				permissionId: 1,
			};

			await controller.addPermission(addPermissionDto);

			const updateDto: UpdateRoleDto = {
				roleName: 'FLOW_ROLE',
				description: 'Updated flow role',
			};

			const updated = await controller.update(created.id, updateDto);
			expect(updated.description).toBe('Updated flow role');

			const removed = await controller.removeById(updated.id);
			expect(removed).toBeUndefined();
		});

		it('should verify service is called exactly once per request', async () => {
			mockRolesService.findOne.mockResolvedValue(mockRole);

			await controller.findOne(1);
			await controller.findOne(1);

			expect(mockRolesService.findOne).toHaveBeenCalledTimes(2);
		});

		it('should handle consecutive create operations', async () => {
			const createDto1: CreateRoleDto = {
				roleName: 'ROLE_1',
				description: 'Role 1',
			};
			const createDto2: CreateRoleDto = {
				roleName: 'ROLE_2',
				description: 'Role 2',
			};

			const role1: Role = {
				id: 10,
				roleName: 'ROLE_1',
				description: 'Role 1',
				createdAt: new Date(),
				updatedAt: new Date(),
				permissions: [],
				users: [],
			};

			const role2: Role = {
				id: 11,
				roleName: 'ROLE_2',
				description: 'Role 2',
				createdAt: new Date(),
				updatedAt: new Date(),
				permissions: [],
				users: [],
			};

			mockRolesService.create.mockResolvedValueOnce(role1);
			mockRolesService.create.mockResolvedValueOnce(role2);

			const result1 = await controller.create(createDto1);
			const result2 = await controller.create(createDto2);

			expect(result1.roleName).toBe('ROLE_1');
			expect(result2.roleName).toBe('ROLE_2');
			expect(mockRolesService.create).toHaveBeenCalledTimes(2);
		});
	});

	describe('error handling and exception branches', () => {
		it('should propagate error from create', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'ERROR_ROLE',
				description: 'Error role',
			};

			const error = new Error('Database connection failed');
			mockRolesService.create.mockRejectedValue(error);

			await expect(controller.create(createDto)).rejects.toThrow(
				'Database connection failed',
			);
		});

		it('should propagate error from findOne', async () => {
			const error = new Error('Database query error');
			mockRolesService.findOne.mockRejectedValue(error);

			await expect(controller.findOne(1)).rejects.toThrow(
				'Database query error',
			);
		});

		it('should propagate error from update', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'FAIL',
				description: 'Fail',
			};

			const error = new Error('Update failed');
			mockRolesService.update.mockRejectedValue(error);

			await expect(controller.update(1, updateDto)).rejects.toThrow(
				'Update failed',
			);
		});

		it('should propagate error from removeById', async () => {
			const error = new Error('Delete failed');
			mockRolesService.removeById.mockRejectedValue(error);

			await expect(controller.removeById(1)).rejects.toThrow(
				'Delete failed',
			);
		});

		it('should propagate error from addPermission', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 1,
			};

			const error = new Error('Permission error');
			mockRolesService.addPermission.mockRejectedValue(error);

			await expect(controller.addPermission(addPermissionDto)).rejects.toThrow(
				'Permission error',
			);
		});
	});
});