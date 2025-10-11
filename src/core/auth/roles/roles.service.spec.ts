import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionNotFoundException, RoleNotFoundException } from '../../../common/exceptions';
import { RoleConflict } from '../../../common/exceptions/role-conflict.exception';
import { AddPermissionDto } from '../dto/add-permissionToRole.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from './roles.service';

describe('RolesService', () => {
	let service: RolesService;
	let mockRoleRepository: {
		exists: jest.Mock;
		create: jest.Mock;
		save: jest.Mock;
		findOneBy: jest.Mock;
		update: jest.Mock;
		softDelete: jest.Mock;
	};
	let mockPermissionsService: {
		findOne: jest.Mock;
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
		mockRoleRepository = {
			exists: jest.fn(),
			create: jest.fn(),
			save: jest.fn(),
			findOneBy: jest.fn(),
			update: jest.fn(),
			softDelete: jest.fn(),
		};

		mockPermissionsService = {
			findOne: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RolesService,
				{
					provide: getRepositoryToken(Role),
					useValue: mockRoleRepository,
				},
				{
					provide: PermissionsService,
					useValue: mockPermissionsService,
				},
			],
		}).compile();

		service = module.get<RolesService>(RolesService);
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
		it('should create a new role successfully', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'ADMIN',
				description: 'Administrator role',
			};

			mockRoleRepository.exists.mockResolvedValue(false);
			mockRoleRepository.create.mockReturnValue(mockRole);
			mockRoleRepository.save.mockResolvedValue(mockRole);

			const result = await service.create(createDto);

			expect(mockRoleRepository.exists).toHaveBeenCalledWith({
				where: { roleName: 'ADMIN' },
			});
			expect(mockRoleRepository.create).toHaveBeenCalledWith(createDto);
			expect(mockRoleRepository.save).toHaveBeenCalledWith(mockRole);
			expect(result).toEqual(mockRole);
		});

		it('should throw RoleConflict when role already exists', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'ADMIN',
				description: 'Administrator role',
			};

			mockRoleRepository.exists.mockResolvedValue(true);

			await expect(service.create(createDto)).rejects.toThrow(
				RoleConflict,
			);
			expect(mockRoleRepository.exists).toHaveBeenCalledWith({
				where: { roleName: 'ADMIN' },
			});
			expect(mockRoleRepository.create).not.toHaveBeenCalled();
			expect(mockRoleRepository.save).not.toHaveBeenCalled();
		});

		it('should handle special characters in role name', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'ADMIN-ROLE_WITH.CHARS',
				description: 'Special characters role',
			};

			const specialRole: Role = {
				...mockRole,
				roleName: createDto.roleName,
				description: createDto.description,
			};

			mockRoleRepository.exists.mockResolvedValue(false);
			mockRoleRepository.create.mockReturnValue(specialRole);
			mockRoleRepository.save.mockResolvedValue(specialRole);

			const result = await service.create(createDto);

			expect(result.roleName).toBe('ADMIN-ROLE_WITH.CHARS');
		});

		it('should create role with empty permissions array', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'NEW_ROLE',
				description: 'New role description',
			};

			const roleWithoutPermissions: Role = {
				...mockRole,
				roleName: 'NEW_ROLE',
				permissions: [],
			};

			mockRoleRepository.exists.mockResolvedValue(false);
			mockRoleRepository.create.mockReturnValue(roleWithoutPermissions);
			mockRoleRepository.save.mockResolvedValue(roleWithoutPermissions);

			const result = await service.create(createDto);

			expect(result.permissions).toEqual([]);
		});
	});

	describe('findByName', () => {
		it('should find a role by name successfully', async () => {
			mockRoleRepository.findOneBy.mockResolvedValue(mockRole);

			const result = await service.findByName('ADMIN');

			expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({
				roleName: 'ADMIN',
			});
			expect(result).toEqual(mockRole);
		});

		it('should throw RoleNotFoundException when role does not exist', async () => {
			mockRoleRepository.findOneBy.mockResolvedValue(null);

			await expect(service.findByName('NON_EXISTENT')).rejects.toThrow(
				RoleNotFoundException,
			);
			expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({
				roleName: 'NON_EXISTENT',
			});
		});

		it('should handle case sensitivity in role name', async () => {
			mockRoleRepository.findOneBy.mockResolvedValue(null);

			await expect(service.findByName('admin')).rejects.toThrow(
				RoleNotFoundException,
			);
		});

		it('should return role with permissions', async () => {
			const roleWithPermissions: Role = {
				...mockRole,
				permissions: [mockPermission, mockPermission2],
			};

			mockRoleRepository.findOneBy.mockResolvedValue(roleWithPermissions);

			const result = await service.findByName('ADMIN');

			expect(result.permissions.length).toBe(2);
		});
	});

	describe('findOne', () => {
		it('should find a role by id successfully', async () => {
			mockRoleRepository.findOneBy.mockResolvedValue(mockRole);

			const result = await service.findOne(1);

			expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(result).toEqual(mockRole);
		});

		it('should throw RoleNotFoundException when role does not exist', async () => {
			mockRoleRepository.findOneBy.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				RoleNotFoundException,
			);
			expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
		});

		it('should work with different valid IDs', async () => {
			const testIds = [1, 5, 100, 9999];

			for (const id of testIds) {
				const roleWithId: Role = {
					...mockRole,
					id,
				};
				mockRoleRepository.findOneBy.mockResolvedValue(roleWithId);

				const result = await service.findOne(id);

				expect(result.id).toBe(id);
				expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id });
			}
		});

		it('should return role with all properties including permissions', async () => {
			const completeRole: Role = {
				...mockRole,
				permissions: [mockPermission, mockPermission2],
			};

			mockRoleRepository.findOneBy.mockResolvedValue(completeRole);

			const result = await service.findOne(1);

			expect(result.id).toBe(1);
			expect(result.roleName).toBe('ADMIN');
			expect(result.permissions.length).toBe(2);
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

			mockRoleRepository.exists.mockResolvedValue(false);
			mockRoleRepository.update.mockResolvedValue({ affected: 1 });
			mockRoleRepository.findOneBy.mockResolvedValue(updatedRole);

			const result = await service.update(1, updateDto);

			expect(mockRoleRepository.exists).toHaveBeenCalledWith({
				where: { roleName: 'SUPER_ADMIN' },
			});
			expect(mockRoleRepository.update).toHaveBeenCalledWith(1, updateDto);
			expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(result).toEqual(updatedRole);
		});

		it('should throw RoleConflict when new role name already exists', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'EXISTING_ROLE',
				description: 'Existing role',
			};

			mockRoleRepository.exists.mockResolvedValue(true);

			await expect(service.update(1, updateDto)).rejects.toThrow(
				RoleConflict,
			);
			expect(mockRoleRepository.update).not.toHaveBeenCalled();
		});

		it('should throw RoleNotFoundException when role to update does not exist', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'NEW_ROLE',
				description: 'New role',
			};

			mockRoleRepository.exists.mockResolvedValue(false);
			mockRoleRepository.update.mockResolvedValue({ affected: 0 });

			await expect(service.update(999, updateDto)).rejects.toThrow(
				RoleNotFoundException,
			);
			expect(mockRoleRepository.update).toHaveBeenCalledWith(999, updateDto);
		});

		it('should handle update with same role name (no conflict)', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'ADMIN',
				description: 'Updated description',
			};

			mockRoleRepository.exists.mockResolvedValue(false);
			mockRoleRepository.update.mockResolvedValue({ affected: 1 });
			mockRoleRepository.findOneBy.mockResolvedValue(mockRole);

			const result = await service.update(1, updateDto);

			expect(result).toEqual(mockRole);
		});

		it('should handle update description only', async () => {
			const updateDto: UpdateRoleDto = {
				roleName: 'ADMIN',
				description: 'New description',
			};

			const updatedRole: Role = {
				...mockRole,
				description: 'New description',
			};

			mockRoleRepository.exists.mockResolvedValue(false);
			mockRoleRepository.update.mockResolvedValue({ affected: 1 });
			mockRoleRepository.findOneBy.mockResolvedValue(updatedRole);

			const result = await service.update(1, updateDto);

			expect(result.description).toBe('New description');
		});
	});

	describe('removeById', () => {
		it('should soft delete a role successfully', async () => {
			mockRoleRepository.softDelete.mockResolvedValue({ affected: 1 });

			await service.removeById(1);

			expect(mockRoleRepository.softDelete).toHaveBeenCalledWith(1);
		});

		it('should throw RoleNotFoundException when role does not exist', async () => {
			mockRoleRepository.softDelete.mockResolvedValue({ affected: 0 });

			await expect(service.removeById(999)).rejects.toThrow(
				RoleNotFoundException,
			);
			expect(mockRoleRepository.softDelete).toHaveBeenCalledWith(999);
		});

		it('should handle multiple delete attempts', async () => {
			const idsToDelete = [1, 2, 3];

			for (const id of idsToDelete) {
				mockRoleRepository.softDelete.mockResolvedValue({ affected: 1 });
				await service.removeById(id);
				expect(mockRoleRepository.softDelete).toHaveBeenCalledWith(id);
			}
		});

		it('should return void successfully', async () => {
			mockRoleRepository.softDelete.mockResolvedValue({ affected: 1 });

			const result = await service.removeById(1);

			expect(result).toBeUndefined();
		});
	});

	describe('addPermission', () => {
		it('should add permission to role successfully', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 2,
			};

			const roleWithoutPermission: Role = {
				...mockRole,
				permissions: [mockPermission],
			};

			const roleWithPermission: Role = {
				...mockRole,
				permissions: [mockPermission, mockPermission2],
			};

			mockRoleRepository.findOneBy.mockResolvedValueOnce(
				roleWithoutPermission,
			);
			mockPermissionsService.findOne.mockResolvedValue(mockPermission2);
			mockRoleRepository.save.mockResolvedValue(roleWithPermission);
			mockRoleRepository.findOneBy.mockResolvedValueOnce(
				roleWithoutPermission,
			);

			await service.addPermission(addPermissionDto);

			expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(mockPermissionsService.findOne).toHaveBeenCalledWith(2);
			expect(mockRoleRepository.save).toHaveBeenCalled();
		});

		it('should not add duplicate permission to role', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 1,
			};

			const roleWithPermission: Role = {
				...mockRole,
				permissions: [mockPermission],
			};

			mockRoleRepository.findOneBy.mockResolvedValue(roleWithPermission);
			mockPermissionsService.findOne.mockResolvedValue(mockPermission);

			await service.addPermission(addPermissionDto);

			expect(mockRoleRepository.save).not.toHaveBeenCalled();
		});

		it('should throw RoleNotFoundException when role does not exist', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 999,
				permissionId: 1,
			};

			mockRoleRepository.findOneBy.mockResolvedValue(null);

			await expect(service.addPermission(addPermissionDto)).rejects.toThrow(
				RoleNotFoundException,
			);
		});

		it('should throw PermissionNotFoundException when permission does not exist', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 999,
			};

			mockRoleRepository.findOneBy.mockResolvedValue(mockRole);
			mockPermissionsService.findOne.mockRejectedValue(
				new PermissionNotFoundException(999),
			);

			await expect(service.addPermission(addPermissionDto)).rejects.toThrow(
				PermissionNotFoundException,
			);
		});

		it('should add multiple permissions to role', async () => {
			const roleWithPermission: Role = {
				...mockRole,
				permissions: [mockPermission, mockPermission2],
			};

			mockRoleRepository.findOneBy.mockResolvedValue(mockRole);
			mockPermissionsService.findOne.mockResolvedValue(mockPermission2);
			mockRoleRepository.save.mockResolvedValue(roleWithPermission);

			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 2,
			};

			await service.addPermission(addPermissionDto);

			expect(mockRoleRepository.save).toHaveBeenCalled();
		});

		it('should return void after adding permission', async () => {
			const addPermissionDto: AddPermissionDto = {
				roleId: 1,
				permissionId: 2,
			};

			mockRoleRepository.findOneBy.mockResolvedValue(mockRole);
			mockPermissionsService.findOne.mockResolvedValue(mockPermission2);
			mockRoleRepository.save.mockResolvedValue({
				...mockRole,
				permissions: [mockPermission, mockPermission2],
			});

			const result = await service.addPermission(addPermissionDto);

			expect(result).toBeUndefined();
		});
	});

	describe('edge cases and integration scenarios', () => {
		it('should handle rapid consecutive creates', async () => {
			const createDto1: CreateRoleDto = {
				roleName: 'ROLE_1',
				description: 'Role 1',
			};
			const createDto2: CreateRoleDto = {
				roleName: 'ROLE_2',
				description: 'Role 2',
			};

			const role1: Role = {
				...mockRole,
				roleName: 'ROLE_1',
			};
			const role2: Role = {
				...mockRole2,
				roleName: 'ROLE_2',
			};

			mockRoleRepository.exists.mockResolvedValueOnce(false);
			mockRoleRepository.create.mockReturnValueOnce(role1);
			mockRoleRepository.save.mockResolvedValueOnce(role1);

			mockRoleRepository.exists.mockResolvedValueOnce(false);
			mockRoleRepository.create.mockReturnValueOnce(role2);
			mockRoleRepository.save.mockResolvedValueOnce(role2);

			const result1 = await service.create(createDto1);
			const result2 = await service.create(createDto2);

			expect(result1.roleName).toBe('ROLE_1');
			expect(result2.roleName).toBe('ROLE_2');
		});

		it('should maintain consistency in find operations', async () => {
			mockRoleRepository.findOneBy.mockResolvedValue(mockRole);

			const resultById = await service.findOne(1);
			const resultByName = await service.findByName('ADMIN');

			expect(resultById).toEqual(resultByName);
			expect(resultById.id).toBe(1);
			expect(resultById.roleName).toBe('ADMIN');
		});

		it('should handle create, add permission, and update flow', async () => {
			const createDto: CreateRoleDto = {
				roleName: 'MODERATOR',
				description: 'Moderator role',
			};

			const moderatorRole: Role = {
				id: 3,
				roleName: 'MODERATOR',
				description: 'Moderator role',
				createdAt: new Date(),
				updatedAt: new Date(),
				permissions: [],
				users: [],
			};

			const moderatorWithPermission: Role = {
				...moderatorRole,
				permissions: [mockPermission],
			};

			mockRoleRepository.exists.mockResolvedValue(false);
			mockRoleRepository.create.mockReturnValue(moderatorRole);
			mockRoleRepository.save.mockResolvedValue(moderatorRole);
			mockRoleRepository.findOneBy.mockResolvedValue(moderatorRole);
			mockPermissionsService.findOne.mockResolvedValue(mockPermission);
			mockRoleRepository.save.mockResolvedValue(moderatorWithPermission);

			const created = await service.create(createDto);
			expect(created.roleName).toBe('MODERATOR');

			const addPermissionDto: AddPermissionDto = {
				roleId: created.id,
				permissionId: 1,
			};

			await service.addPermission(addPermissionDto);
			expect(mockPermissionsService.findOne).toHaveBeenCalled();
		});
	});
});