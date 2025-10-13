import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';

describe('SpeciesController', () => {
	let controller: SpeciesController;
	let service: SpeciesService;

	const mockSpeciesService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [SpeciesController],
			providers: [
				{
					provide: SpeciesService,
					useValue: mockSpeciesService,
				},
			],
		}).compile();

		controller = module.get<SpeciesController>(SpeciesController);
		service = module.get<SpeciesService>(SpeciesService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new species', async () => {
			const createSpeciesDto: CreateSpeciesDto = {
				name: 'Perro',
				description: 'Mamífero doméstico',
			};

			const mockResult = { id: 1, ...createSpeciesDto };
			mockSpeciesService.create.mockResolvedValue(mockResult);

			const result = await controller.create(createSpeciesDto);

			expect(service.create).toHaveBeenCalledWith(createSpeciesDto);
			expect(result).toEqual(mockResult);
		});
	});

	describe('findAll', () => {
		it('should return all species', async () => {
			const mockSpecies = [
				{ id: 1, name: 'Perro', description: 'Mamífero doméstico' },
				{ id: 2, name: 'Gato', description: 'Felino doméstico' },
			];

			mockSpeciesService.findAll.mockResolvedValue(mockSpecies);

			const result = await controller.findAll();

			expect(service.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockSpecies);
		});
	});

	describe('findOne', () => {
		it('should return a species by id', async () => {
			const mockSpecies = { id: 1, name: 'Perro', description: 'Mamífero doméstico' };

			mockSpeciesService.findOne.mockResolvedValue(mockSpecies);

			const result = await controller.findOne(1);

			expect(service.findOne).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockSpecies);
		});
	});

	describe('update', () => {
		it('should update a species', async () => {
			const updateSpeciesDto: UpdateSpeciesDto = {
				name: 'Perro Actualizado',
			};

			const mockResult = { id: 1, name: 'Perro Actualizado' };
			mockSpeciesService.update.mockResolvedValue(mockResult);

			const result = await controller.update(1, updateSpeciesDto);

			expect(service.update).toHaveBeenCalledWith(1, updateSpeciesDto);
			expect(result).toEqual(mockResult);
		});
	});

	describe('remove', () => {
		it('should remove a species', async () => {
			mockSpeciesService.remove.mockResolvedValue(undefined);

			await controller.remove(1);

			expect(service.remove).toHaveBeenCalledWith(1);
		});
	});
});