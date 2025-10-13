import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeciesConflictException, SpeciesNotFoundException } from '../../common/exceptions';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { Species } from './entities/species.entity';
import { SpeciesService } from './species.service';

describe('SpeciesService', () => {
	let service: SpeciesService;
	let repository: Repository<Species>;

	const mockSpeciesRepository = {
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
				SpeciesService,
				{
					provide: getRepositoryToken(Species),
					useValue: mockSpeciesRepository,
				},
			],
		}).compile();

		service = module.get<SpeciesService>(SpeciesService);
		repository = module.get<Repository<Species>>(getRepositoryToken(Species));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new species successfully', async () => {
			const createSpeciesDto: CreateSpeciesDto = {
				name: 'Perro',
				description: 'Mamífero doméstico',
			};

			const mockSpecies = { id: 1, ...createSpeciesDto, isDeleted: false };

			mockSpeciesRepository.findOne.mockResolvedValue(null);
			mockSpeciesRepository.create.mockReturnValue(mockSpecies);
			mockSpeciesRepository.save.mockResolvedValue(mockSpecies);

			const result = await service.create(createSpeciesDto);

			expect(mockSpeciesRepository.findOne).toHaveBeenCalledWith({
				where: { name: createSpeciesDto.name },
			});
			expect(mockSpeciesRepository.create).toHaveBeenCalledWith(createSpeciesDto);
			expect(mockSpeciesRepository.save).toHaveBeenCalledWith(mockSpecies);
			expect(result).toEqual(mockSpecies);
		});

		it('should throw SpeciesConflictException when species already exists', async () => {
			const createSpeciesDto: CreateSpeciesDto = {
				name: 'Perro',
				description: 'Mamífero doméstico',
			};

			const existingSpecies = { id: 1, ...createSpeciesDto };
			mockSpeciesRepository.findOne.mockResolvedValue(existingSpecies);

			await expect(service.create(createSpeciesDto)).rejects.toThrow(SpeciesConflictException);
			expect(mockSpeciesRepository.findOne).toHaveBeenCalledWith({
				where: { name: createSpeciesDto.name },
			});
			expect(mockSpeciesRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('findAll', () => {
		it('should return all species', async () => {
			const mockSpecies = [
				{ id: 1, name: 'Perro', description: 'Mamífero doméstico' },
				{ id: 2, name: 'Gato', description: 'Felino doméstico' },
			];

			mockSpeciesRepository.find.mockResolvedValue(mockSpecies);

			const result = await service.findAll();

			expect(mockSpeciesRepository.find).toHaveBeenCalledWith({
				order: { name: 'ASC' },
			});
			expect(result).toEqual(mockSpecies);
		});
	});

	describe('findOne', () => {
		it('should return a species by id', async () => {
			const mockSpecies = { id: 1, name: 'Perro', description: 'Mamífero doméstico' };

			mockSpeciesRepository.findOne.mockResolvedValue(mockSpecies);

			const result = await service.findOne(1);

			expect(mockSpeciesRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 },
				relations: ['pets'],
			});
			expect(result).toEqual(mockSpecies);
		});

		it('should throw SpeciesNotFoundException when species not found', async () => {
			mockSpeciesRepository.findOne.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(SpeciesNotFoundException);
			expect(mockSpeciesRepository.findOne).toHaveBeenCalledWith({
				where: { id: 999 },
				relations: ['pets'],
			});
		});
	});

	describe('update', () => {
		it('should update a species successfully', async () => {
			const updateSpeciesDto: UpdateSpeciesDto = {
				name: 'Perro Actualizado',
				description: 'Descripción actualizada',
			};

			const existingSpecies = { id: 1, name: 'Perro', description: 'Original' };
			const updatedSpecies = { ...existingSpecies, ...updateSpeciesDto };

			// Name conflict check (returns null = no conflict)
			mockSpeciesRepository.findOne
				.mockResolvedValueOnce(null) // First call for name conflict check
				.mockResolvedValueOnce(updatedSpecies); // Second call for returning updated (findOne at the end)

			mockSpeciesRepository.update.mockResolvedValue({ affected: 1 });

			const result = await service.update(1, updateSpeciesDto);

			expect(mockSpeciesRepository.findOne).toHaveBeenNthCalledWith(1, {
				where: { name: updateSpeciesDto.name },
			});
			expect(mockSpeciesRepository.update).toHaveBeenCalledWith(1, updateSpeciesDto);
			expect(result).toEqual(updatedSpecies);
		});

		it('should throw SpeciesNotFoundException when updating non-existent species', async () => {
			const updateSpeciesDto: UpdateSpeciesDto = { name: 'New Name' };

			mockSpeciesRepository.findOne.mockResolvedValue(null);
			mockSpeciesRepository.update.mockResolvedValue({ affected: 0 });

			await expect(service.update(999, updateSpeciesDto)).rejects.toThrow(SpeciesNotFoundException);
		});
	});

	describe('remove', () => {
		it('should soft delete a species successfully', async () => {
			const existingSpecies = { id: 1, name: 'Perro', description: 'Test' };

			mockSpeciesRepository.findOne.mockResolvedValue(existingSpecies);
			mockSpeciesRepository.softDelete.mockResolvedValue({ affected: 1 });

			await service.remove(1);

			expect(mockSpeciesRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 },
				relations: ['pets'],
			});
			expect(mockSpeciesRepository.softDelete).toHaveBeenCalledWith(1);
		});

		it('should throw SpeciesNotFoundException when removing non-existent species', async () => {
			mockSpeciesRepository.findOne.mockResolvedValue(null);

			await expect(service.remove(999)).rejects.toThrow(SpeciesNotFoundException);
			expect(mockSpeciesRepository.softDelete).not.toHaveBeenCalled();
		});
	});
});