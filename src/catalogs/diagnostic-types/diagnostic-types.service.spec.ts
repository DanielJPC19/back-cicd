import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticTypesService } from './diagnostic-types.service';
import { DiagnosticType } from './entities/diagnostic-type.entity';
import { CreateDiagnosticTypeDto } from './dto/create-diagnostic-type.dto';
import { UpdateDiagnosticTypeDto } from './dto/update-diagnostic-type.dto';
import { DiagnosticTypeConflictException, DiagnosticTypeNotFoundException } from '../../common/exceptions';

describe('DiagnosticTypesService', () => {
	let service: DiagnosticTypesService;
	let repository: Repository<DiagnosticType>;

	const mockDiagnosticTypeRepository = {
		create: jest.fn(),
		save: jest.fn(),
		find: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		softDelete: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DiagnosticTypesService,
				{
					provide: getRepositoryToken(DiagnosticType),
					useValue: mockDiagnosticTypeRepository,
				},
			],
		}).compile();

		service = module.get<DiagnosticTypesService>(DiagnosticTypesService);
		repository = module.get<Repository<DiagnosticType>>(getRepositoryToken(DiagnosticType));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new diagnostic type successfully', async () => {
			const createDiagnosticTypeDto: CreateDiagnosticTypeDto = {
				name: 'Radiografía',
			};

			const mockDiagnosticType = { id: 1, ...createDiagnosticTypeDto, isDeleted: false };

			mockDiagnosticTypeRepository.findOne.mockResolvedValue(null);
			mockDiagnosticTypeRepository.create.mockReturnValue(mockDiagnosticType);
			mockDiagnosticTypeRepository.save.mockResolvedValue(mockDiagnosticType);

			const result = await service.create(createDiagnosticTypeDto);

			expect(mockDiagnosticTypeRepository.findOne).toHaveBeenCalledWith({
				where: { name: createDiagnosticTypeDto.name },
			});
			expect(mockDiagnosticTypeRepository.create).toHaveBeenCalledWith(createDiagnosticTypeDto);
			expect(mockDiagnosticTypeRepository.save).toHaveBeenCalledWith(mockDiagnosticType);
			expect(result).toEqual(mockDiagnosticType);
		});

		it('should throw DiagnosticTypeConflictException when diagnostic type already exists', async () => {
			const createDiagnosticTypeDto: CreateDiagnosticTypeDto = {
				name: 'Radiografía',
			};

			const existingDiagnosticType = { id: 1, ...createDiagnosticTypeDto };
			mockDiagnosticTypeRepository.findOne.mockResolvedValue(existingDiagnosticType);

			await expect(service.create(createDiagnosticTypeDto)).rejects.toThrow(DiagnosticTypeConflictException);
			expect(mockDiagnosticTypeRepository.findOne).toHaveBeenCalledWith({
				where: { name: createDiagnosticTypeDto.name },
			});
			expect(mockDiagnosticTypeRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('findAll', () => {
		it('should return all diagnostic types', async () => {
			const mockDiagnosticTypes = [
				{ id: 1, name: 'Radiografía' },
				{ id: 2, name: 'Ecografía' },
			];

			mockDiagnosticTypeRepository.find.mockResolvedValue(mockDiagnosticTypes);

			const result = await service.findAll();

			expect(mockDiagnosticTypeRepository.find).toHaveBeenCalledWith({
				order: { name: 'ASC' },
			});
			expect(result).toEqual(mockDiagnosticTypes);
		});
	});

	describe('findOne', () => {
		it('should return a diagnostic type by id', async () => {
			const mockDiagnosticType = { id: 1, name: 'Radiografía' };

			mockDiagnosticTypeRepository.findOne.mockResolvedValue(mockDiagnosticType);

			const result = await service.findOne(1);

			expect(mockDiagnosticTypeRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 },
				relations: ['diagnostics'],
			});
			expect(result).toEqual(mockDiagnosticType);
		});

		it('should throw DiagnosticTypeNotFoundException when diagnostic type not found', async () => {
			mockDiagnosticTypeRepository.findOne.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(DiagnosticTypeNotFoundException);
			expect(mockDiagnosticTypeRepository.findOne).toHaveBeenCalledWith({
				where: { id: 999 },
				relations: ['diagnostics'],
			});
		});
	});

	describe('update', () => {
		it('should update a diagnostic type successfully', async () => {
			const updateDiagnosticTypeDto: UpdateDiagnosticTypeDto = {
				name: 'Radiografía Actualizada',
			};

			const existingDiagnosticType = { id: 1, name: 'Radiografía' };
			const updatedDiagnosticType = { ...existingDiagnosticType, ...updateDiagnosticTypeDto };

			// Name conflict check (returns null = no conflict)
			mockDiagnosticTypeRepository.findOne
				.mockResolvedValueOnce(null) // First call for name conflict check
				.mockResolvedValueOnce(updatedDiagnosticType); // Second call for returning updated (findOne at the end)

			mockDiagnosticTypeRepository.update.mockResolvedValue({ affected: 1 });

			const result = await service.update(1, updateDiagnosticTypeDto);

			expect(mockDiagnosticTypeRepository.findOne).toHaveBeenNthCalledWith(1, {
				where: { name: updateDiagnosticTypeDto.name },
			});
			expect(mockDiagnosticTypeRepository.update).toHaveBeenCalledWith(1, updateDiagnosticTypeDto);
			expect(result).toEqual(updatedDiagnosticType);
		});

		it('should throw DiagnosticTypeNotFoundException when updating non-existent diagnostic type', async () => {
			const updateDiagnosticTypeDto: UpdateDiagnosticTypeDto = { name: 'New Name' };

			mockDiagnosticTypeRepository.findOne.mockResolvedValue(null);
			mockDiagnosticTypeRepository.update.mockResolvedValue({ affected: 0 });

			await expect(service.update(999, updateDiagnosticTypeDto)).rejects.toThrow(DiagnosticTypeNotFoundException);
		});
	});

	describe('remove', () => {
		it('should soft delete a diagnostic type successfully', async () => {
			const existingDiagnosticType = { id: 1, name: 'Radiografía' };

			mockDiagnosticTypeRepository.findOne.mockResolvedValue(existingDiagnosticType);
			mockDiagnosticTypeRepository.softDelete.mockResolvedValue({ affected: 1 });

			await service.remove(1);

			expect(mockDiagnosticTypeRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 },
				relations: ['diagnostics'],
			});
			expect(mockDiagnosticTypeRepository.softDelete).toHaveBeenCalledWith(1);
		});

		it('should throw DiagnosticTypeNotFoundException when removing non-existent diagnostic type', async () => {
			mockDiagnosticTypeRepository.findOne.mockResolvedValue(null);

			await expect(service.remove(999)).rejects.toThrow(DiagnosticTypeNotFoundException);
			expect(mockDiagnosticTypeRepository.softDelete).not.toHaveBeenCalled();
		});
	});
});