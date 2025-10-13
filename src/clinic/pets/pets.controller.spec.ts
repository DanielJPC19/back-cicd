import { Test, TestingModule } from '@nestjs/testing';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetGender } from './entities/pet.entity';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

describe('PetsController', () => {
	let controller: PetsController;
	let service: PetsService;

	const mockPetsService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findByOwner: jest.fn(),
		findBySpecies: jest.fn(),
		update: jest.fn(),
		removeById: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PetsController],
			providers: [
				{
					provide: PetsService,
					useValue: mockPetsService,
				},
			],
		}).compile();

		controller = module.get<PetsController>(PetsController);
		service = module.get<PetsService>(PetsService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new pet', async () => {
			const createPetDto: CreatePetDto = {
				name: 'Buddy',
				gender: PetGender.MALE,
				species: 'Perro',
				speciesId: 1,
				breed: 'Golden Retriever',
				birthDate: new Date('2020-01-01'),
				ownerId: 1,
			};

			const mockResult = { id: 1, ...createPetDto };
			mockPetsService.create.mockResolvedValue(mockResult);

			const result = await controller.create(createPetDto);

			expect(service.create).toHaveBeenCalledWith(createPetDto);
			expect(result).toEqual(mockResult);
		});
	});

	describe('findAll', () => {
		it('should return all pets', async () => {
			const mockPets = [
				{ id: 1, name: 'Buddy', gender: PetGender.MALE },
				{ id: 2, name: 'Bella', gender: PetGender.FEMALE },
			];

			mockPetsService.findAll.mockResolvedValue(mockPets);

			const result = await controller.findAll();

			expect(service.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockPets);
		});
	});

	describe('findOne', () => {
		it('should return a pet by id', async () => {
			const mockPet = { id: 1, name: 'Buddy', gender: PetGender.MALE };

			mockPetsService.findOne.mockResolvedValue(mockPet);

			const result = await controller.findOne(1);

			expect(service.findOne).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockPet);
		});
	});

	describe('findByOwner', () => {
		it('should return pets by owner id', async () => {
			const mockPets = [
				{ id: 1, name: 'Buddy', ownerId: 1 },
				{ id: 2, name: 'Bella', ownerId: 1 },
			];

			mockPetsService.findByOwner.mockResolvedValue(mockPets);

			const result = await controller.findByOwner(1);

			expect(service.findByOwner).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockPets);
		});
	});

	describe('findBySpecies', () => {
		it('should return pets by species id', async () => {
			const mockPets = [
				{ id: 1, name: 'Buddy', speciesId: 1 },
				{ id: 2, name: 'Rex', speciesId: 1 },
			];

			mockPetsService.findBySpecies.mockResolvedValue(mockPets);

			const result = await controller.findBySpecies(1);

			expect(service.findBySpecies).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockPets);
		});
	});

	describe('update', () => {
		it('should update a pet', async () => {
			const updatePetDto: UpdatePetDto = {
				name: 'Buddy Updated',
				breed: 'Golden Retriever Updated',
			};

			const mockResult = { id: 1, name: 'Buddy Updated', breed: 'Golden Retriever Updated' };
			mockPetsService.update.mockResolvedValue(mockResult);

			const result = await controller.update(1, updatePetDto);

			expect(service.update).toHaveBeenCalledWith(1, updatePetDto);
			expect(result).toEqual(mockResult);
		});
	});

	describe('removeById', () => {
		it('should remove a pet', async () => {
			mockPetsService.removeById.mockResolvedValue(undefined);

			await controller.removeById(1);

			expect(service.removeById).toHaveBeenCalledWith(1);
		});
	});
});