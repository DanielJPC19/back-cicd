import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionConflict, PermissionNotFoundException } from '../../../common/exceptions';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
	let service: PermissionsService;
	let mockRepository: {
		exists: jest.Mock;
		create: jest.Mock;
		save: jest.Mock;
		findOneBy: jest.Mock;
		update: jest.Mock;
		softDelete: jest.Mock;
	};

	const mockPermission: Permission = {
		id: 1,
		permissionName: 'CREATE_USER',
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
	};



	beforeEach(async () => {
		mockRepository = {
			exists: jest.fn(),
			create: jest.fn(),
			save: jest.fn(),
			findOneBy: jest.fn(),
			update: jest.fn(),
			softDelete: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PermissionsService,
				{
					provide: getRepositoryToken(Permission),
					useValue: mockRepository,
				},
			],
		}).compile();

		service = module.get<PermissionsService>(PermissionsService);
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
		it('should create a new permission successfully', async () => {
			const createDto: CreatePermissionDto = {
				permissionName: 'CREATE_USER',
			};

			mockRepository.exists.mockResolvedValue(false);
			mockRepository.create.mockReturnValue(mockPermission);
			mockRepository.save.mockResolvedValue(mockPermission);

			const result = await service.create(createDto);

			expect(mockRepository.exists).toHaveBeenCalledWith({
				where: { permissionName: 'CREATE_USER' },
			});
			expect(mockRepository.create).toHaveBeenCalledWith(createDto);
			expect(mockRepository.save).toHaveBeenCalledWith(mockPermission);
			expect(result).toEqual(mockPermission);
		});

		it('should throw ConflictException when permission already exists', async () => {
			const createDto: CreatePermissionDto = {
				permissionName: 'CREATE_USER',
			};

			mockRepository.exists.mockResolvedValue(true);

			await expect(service.create(createDto)).rejects.toThrow(
				ConflictException,
			);
			expect(mockRepository.exists).toHaveBeenCalledWith({
				where: { permissionName: 'CREATE_USER' },
			});
			expect(mockRepository.create).not.toHaveBeenCalled();
			expect(mockRepository.save).not.toHaveBeenCalled();
		});

		it('should handle special characters in permission name', async () => {
			const createDto: CreatePermissionDto = {
				permissionName: 'CREATE_USER_WITH-SPECIAL.CHARS_123',
			};

			const specialCharPermission: Permission = {
				...mockPermission,
				permissionName: createDto.permissionName,
			};

			mockRepository.exists.mockResolvedValue(false);
			mockRepository.create.mockReturnValue(specialCharPermission);
			mockRepository.save.mockResolvedValue(specialCharPermission);

			const result = await service.create(createDto);

			expect(result.permissionName).toBe(
				'CREATE_USER_WITH-SPECIAL.CHARS_123',
			);
		});
	});

	describe('findByName', () => {
		it('should find a permission by name successfully', async () => {
			mockRepository.findOneBy.mockResolvedValue(mockPermission);

			const result = await service.findByName('CREATE_USER');

			expect(mockRepository.findOneBy).toHaveBeenCalledWith({
				permissionName: 'CREATE_USER',
			});
			expect(result).toEqual(mockPermission);
		});

		it('should throw PermissionNotFoundException when permission does not exist', async () => {
			mockRepository.findOneBy.mockResolvedValue(null);

			await expect(service.findByName('NON_EXISTENT')).rejects.toThrow(
				PermissionNotFoundException,
			);
			expect(mockRepository.findOneBy).toHaveBeenCalledWith({
				permissionName: 'NON_EXISTENT',
			});
		});

		it('should handle case sensitivity in permission name', async () => {
			mockRepository.findOneBy.mockResolvedValue(null);

			await expect(service.findByName('create_user')).rejects.toThrow(
				PermissionNotFoundException,
			);
		});
	});

	describe('findOne', () => {
		it('should find a permission by id successfully', async () => {
			mockRepository.findOneBy.mockResolvedValue(mockPermission);

			const result = await service.findOne(1);

			expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(result).toEqual(mockPermission);
		});

		it('should throw PermissionNotFoundException when permission does not exist', async () => {
			mockRepository.findOneBy.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				PermissionNotFoundException,
			);
			expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
		});

		it('should work with different valid IDs', async () => {
			const testIds = [1, 5, 100, 9999];

			for (const id of testIds) {
				const permissionWithId: Permission = {
					...mockPermission,
					id,
				};
				mockRepository.findOneBy.mockResolvedValue(permissionWithId);

				const result = await service.findOne(id);

				expect(result.id).toBe(id);
				expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
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

			mockRepository.exists.mockResolvedValue(false);
			mockRepository.update.mockResolvedValue({ affected: 1 });
			mockRepository.findOneBy.mockResolvedValue(updatedPermission);

			const result = await service.update(1, updateDto);

			expect(mockRepository.exists).toHaveBeenCalledWith({
				where: { permissionName: 'UPDATE_USER' },
			});
			expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
			expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(result).toEqual(updatedPermission);
		});

		it('should throw PermissionConflict when new permission name already exists', async () => {
			const updateDto: UpdatePermissionDto = {
				permissionName: 'EXISTING_PERMISSION',
			};

			mockRepository.exists.mockResolvedValue(true);

			await expect(service.update(1, updateDto)).rejects.toThrow(
				PermissionConflict,
			);
			expect(mockRepository.update).not.toHaveBeenCalled();
		});

		it('should throw PermissionNotFoundException when permission to update does not exist', async () => {
			const updateDto: UpdatePermissionDto = {
				permissionName: 'NEW_PERMISSION',
			};

			mockRepository.exists.mockResolvedValue(false);
			mockRepository.update.mockResolvedValue({ affected: 0 });

			await expect(service.update(999, updateDto)).rejects.toThrow(
				PermissionNotFoundException,
			);
			expect(mockRepository.update).toHaveBeenCalledWith(999, updateDto);
		});

		it('should handle update with same permission name (no conflict)', async () => {
			const updateDto: UpdatePermissionDto = {
				permissionName: 'CREATE_USER',
			};

			mockRepository.exists.mockResolvedValue(false);
			mockRepository.update.mockResolvedValue({ affected: 1 });
			mockRepository.findOneBy.mockResolvedValue(mockPermission);

			const result = await service.update(1, updateDto);

			expect(result).toEqual(mockPermission);
		});
	});

	describe('removeById', () => {
		it('should soft delete a permission successfully', async () => {
			mockRepository.softDelete.mockResolvedValue({ affected: 1 });

			await service.removeById(1);

			expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
		});

		it('should throw PermissionNotFoundException when permission does not exist', async () => {
			mockRepository.softDelete.mockResolvedValue({ affected: 0 });

			await expect(service.removeById(999)).rejects.toThrow(
				PermissionNotFoundException,
			);
			expect(mockRepository.softDelete).toHaveBeenCalledWith(999);
		});

		it('should handle multiple delete attempts', async () => {
			const idsToDelete = [1, 2, 3];

			for (const id of idsToDelete) {
				mockRepository.softDelete.mockResolvedValue({ affected: 1 });
				await service.removeById(id);
				expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
			}
		});

		it('should return void successfully', async () => {
			mockRepository.softDelete.mockResolvedValue({ affected: 1 });

			const result = await service.removeById(1);

			expect(result).toBeUndefined();
		});
	});

	

});