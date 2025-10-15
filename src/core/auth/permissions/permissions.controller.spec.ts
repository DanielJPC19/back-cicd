import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';
import { ConflictException } from '@nestjs/common';
import { PermissionNotFoundException, PermissionConflict } from '../../../common/exceptions';

describe('PermissionsController', () => {
	let controller: PermissionsController;
	let mockPermissionsService: {
		create: jest.Mock;
		findOne: jest.Mock;
		update: jest.Mock;
		removeById: jest.Mock;
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

	beforeEach(async () => {
		mockPermissionsService = {
			create: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			removeById: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [PermissionsController],
			providers: [
				{
					provide: PermissionsService,
					useValue: mockPermissionsService,
				},
			],
		})
			.overrideGuard('AuthGuard')
			.useValue({})
			.overrideGuard('PermissionsGuard')
			.useValue({})
			.compile();

		controller = module.get<PermissionsController>(PermissionsController);
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
		it('should create a new permission successfully', async () => {
			const createDto: CreatePermissionDto = {
				permissionName: 'CREATE_USER',
			};

			mockPermissionsService.create.mockResolvedValue(mockPermission);

			const result = await controller.create(createDto);

			expect(mockPermissionsService.create).toHaveBeenCalledWith(createDto);
			expect(mockPermissionsService.create).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockPermission);
		});

		it('should throw ConflictException when permission already exists', async () => {
			const createDto: CreatePermissionDto = {
				permissionName: 'CREATE_USER',
			};

			mockPermissionsService.create.mockRejectedValue(
				new ConflictException(),
			);

			await expect(controller.create(createDto)).rejects.toThrow(
				ConflictException,
			);
			expect(mockPermissionsService.create).toHaveBeenCalledWith(createDto);
		});

		it('should handle special characters in permission name during creation', async () => {
			const createDto: CreatePermissionDto = {
				permissionName: 'CREATE_USER_WITH-SPECIAL.CHARS_123',
			};

			const specialPermission: Permission = {
				...mockPermission,
				permissionName: createDto.permissionName,
			};

			mockPermissionsService.create.mockResolvedValue(specialPermission);

			const result = await controller.create(createDto);

			expect(result.permissionName).toBe(
				'CREATE_USER_WITH-SPECIAL.CHARS_123',
			);
		});
	});

	describe('findOne', () => {
		it('should find a permission by id successfully', async () => {
			mockPermissionsService.findOne.mockResolvedValue(mockPermission);

			const result = await controller.findOne(1);

			expect(mockPermissionsService.findOne).toHaveBeenCalledWith(1);
			expect(mockPermissionsService.findOne).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockPermission);
		});

		it('should throw PermissionNotFoundException when permission does not exist', async () => {
			mockPermissionsService.findOne.mockRejectedValue(
				new PermissionNotFoundException(999),
			);

			await expect(controller.findOne(999)).rejects.toThrow(
				PermissionNotFoundException,
			);
			expect(mockPermissionsService.findOne).toHaveBeenCalledWith(999);
		});

		it('should find different permissions by id', async () => {
			mockPermissionsService.findOne.mockResolvedValue(mockPermission2);

			const result = await controller.findOne(2);

			expect(result).toEqual(mockPermission2);
			expect(result.permissionName).toBe('DELETE_USER');
		});

		it('should work with various valid IDs', async () => {
			const testIds = [1, 5, 100, 9999];

			for (const id of testIds) {
				const permissionWithId: Permission = {
					...mockPermission,
					id,
				};
				mockPermissionsService.findOne.mockResolvedValue(permissionWithId);

				const result = await controller.findOne(id);

				expect(result.id).toBe(id);
				expect(mockPermissionsService.findOne).toHaveBeenCalledWith(id);
			}
		});
	});

	describe('update', () => {
		it('should update a permission successfully', async () => {
			const updateDto: UpdatePermissionDto = {
				permissionName: 'UPDATE_USER',
			};

			const updatedPermission: Permission = {
				...mockPermission,
				permissionName: 'UPDATE_USER',
			};

			mockPermissionsService.update.mockResolvedValue(updatedPermission);

			const result = await controller.update(1, updateDto);

			expect(mockPermissionsService.update).toHaveBeenCalledWith(1, updateDto);
			expect(mockPermissionsService.update).toHaveBeenCalledTimes(1);
			expect(result).toEqual(updatedPermission);
		});

		it('should throw PermissionConflict when new permission name already exists', async () => {
			const updateDto: UpdatePermissionDto = {
				permissionName: 'EXISTING_PERMISSION',
			};

			mockPermissionsService.update.mockRejectedValue(
				new PermissionConflict('EXISTING_PERMISSION'),
			);

			await expect(controller.update(1, updateDto)).rejects.toThrow(
				PermissionConflict,
			);
			expect(mockPermissionsService.update).toHaveBeenCalledWith(1, updateDto);
		});

		it('should throw PermissionNotFoundException when permission to update does not exist', async () => {
			const updateDto: UpdatePermissionDto = {
				permissionName: 'NEW_PERMISSION',
			};

			mockPermissionsService.update.mockRejectedValue(
				new PermissionNotFoundException(999),
			);

			await expect(controller.update(999, updateDto)).rejects.toThrow(
				PermissionNotFoundException,
			);
			expect(mockPermissionsService.update).toHaveBeenCalledWith(999, updateDto);
		});

		it('should handle update with same permission name (no conflict)', async () => {
			const updateDto: UpdatePermissionDto = {
				permissionName: 'CREATE_USER',
			};

			mockPermissionsService.update.mockResolvedValue(mockPermission);

			const result = await controller.update(1, updateDto);

			expect(result).toEqual(mockPermission);
		});

		it('should update multiple permissions sequentially', async () => {
			const updateDto1: UpdatePermissionDto = {
				permissionName: 'UPDATE_USER_1',
			};
			const updateDto2: UpdatePermissionDto = {
				permissionName: 'UPDATE_USER_2',
			};

			const updatedPermission1: Permission = {
				...mockPermission,
				id: 1,
				permissionName: 'UPDATE_USER_1',
			};
			const updatedPermission2: Permission = {
				...mockPermission2,
				id: 2,
				permissionName: 'UPDATE_USER_2',
			};

			mockPermissionsService.update.mockResolvedValueOnce(updatedPermission1);
			mockPermissionsService.update.mockResolvedValueOnce(updatedPermission2);

			const result1 = await controller.update(1, updateDto1);
			const result2 = await controller.update(2, updateDto2);

			expect(result1.permissionName).toBe('UPDATE_USER_1');
			expect(result2.permissionName).toBe('UPDATE_USER_2');
			expect(mockPermissionsService.update).toHaveBeenCalledTimes(2);
		});
	});

	describe('removeById', () => {
		it('should remove a permission successfully', async () => {
			mockPermissionsService.removeById.mockResolvedValue(undefined);

			const result = await controller.removeById(1);

			expect(mockPermissionsService.removeById).toHaveBeenCalledWith(1);
			expect(mockPermissionsService.removeById).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined();
		});

		it('should throw PermissionNotFoundException when permission does not exist', async () => {
			mockPermissionsService.removeById.mockRejectedValue(
				new PermissionNotFoundException(999),
			);

			await expect(controller.removeById(999)).rejects.toThrow(
				PermissionNotFoundException,
			);
			expect(mockPermissionsService.removeById).toHaveBeenCalledWith(999);
		});

		it('should remove multiple permissions sequentially', async () => {
			mockPermissionsService.removeById.mockResolvedValue(undefined);

			const result1 = await controller.removeById(1);
			const result2 = await controller.removeById(2);
			const result3 = await controller.removeById(3);

			expect(result1).toBeUndefined();
			expect(result2).toBeUndefined();
			expect(result3).toBeUndefined();
			expect(mockPermissionsService.removeById).toHaveBeenCalledTimes(3);
			expect(mockPermissionsService.removeById).toHaveBeenNthCalledWith(1, 1);
			expect(mockPermissionsService.removeById).toHaveBeenNthCalledWith(2, 2);
			expect(mockPermissionsService.removeById).toHaveBeenNthCalledWith(3, 3);
		});
	});

	describe('integration scenarios', () => {
		it('should handle create and then find the created permission', async () => {
			const createDto: CreatePermissionDto = {
				permissionName: 'NEW_PERMISSION',
			};

			const newPermission: Permission = {
				id: 3,
				permissionName: 'NEW_PERMISSION',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockPermissionsService.create.mockResolvedValue(newPermission);
			mockPermissionsService.findOne.mockResolvedValue(newPermission);

			const createdResult = await controller.create(createDto);
			const foundResult = await controller.findOne(createdResult.id);

			expect(createdResult).toEqual(newPermission);
			expect(foundResult).toEqual(newPermission);
			expect(mockPermissionsService.create).toHaveBeenCalledWith(createDto);
			expect(mockPermissionsService.findOne).toHaveBeenCalledWith(3);
		});

		it('should handle create, update, and remove flow', async () => {
			const createDto: CreatePermissionDto = {
				permissionName: 'PERMISSION_FLOW',
			};

			const updateDto: UpdatePermissionDto = {
				permissionName: 'PERMISSION_FLOW_UPDATED',
			};

			const createdPermission: Permission = {
				id: 4,
				permissionName: 'PERMISSION_FLOW',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const updatedPermission: Permission = {
				...createdPermission,
				permissionName: 'PERMISSION_FLOW_UPDATED',
			};

			mockPermissionsService.create.mockResolvedValue(createdPermission);
			mockPermissionsService.update.mockResolvedValue(updatedPermission);
			mockPermissionsService.removeById.mockResolvedValue(undefined);

			const created = await controller.create(createDto);
			const updated = await controller.update(created.id, updateDto);
			const removed = await controller.removeById(updated.id);

			expect(created.permissionName).toBe('PERMISSION_FLOW');
			expect(updated.permissionName).toBe('PERMISSION_FLOW_UPDATED');
			expect(removed).toBeUndefined();
		});

		it('should verify service is called exactly once per request', async () => {
			mockPermissionsService.findOne.mockResolvedValue(mockPermission);

			await controller.findOne(1);
			await controller.findOne(1);

			expect(mockPermissionsService.findOne).toHaveBeenCalledTimes(2);
		});
	});
});