import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeciesService } from '../../catalogs/species/species.service';
import { PetNotFoundException } from '../../common/exceptions';
import { UsersService } from '../../core/auth/users/users.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet, PetGender } from './entities/pet.entity';
import { PetsService } from './pets.service';

describe('PetsService', () => {
	let service: PetsService;
	let repository: Repository<Pet>;
	let usersService: UsersService;
	let speciesService: SpeciesService;

	const mockPetRepository = {
		create: jest.fn(),
		save: jest.fn(),
		find: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		softDelete: jest.fn(),
	};

	const mockUsersService = {
		findOne: jest.fn(),
	};

	const mockSpeciesService = {
		findOne: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PetsService,
				{
					provide: getRepositoryToken(Pet),
					useValue: mockPetRepository,
				},
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
				{
					provide: SpeciesService,
					useValue: mockSpeciesService,
				},
			],
		}).compile();

		service = module.get<PetsService>(PetsService);
		repository = module.get<Repository<Pet>>(getRepositoryToken(Pet));
		usersService = module.get<UsersService>(UsersService);
		speciesService = module.get<SpeciesService>(SpeciesService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new pet successfully', async () => {
			const createPetDto: CreatePetDto = {
				name: 'Buddy',
				gender: PetGender.MALE,
				speciesId: 1,
				breed: 'Golden Retriever',
				birthDate: new Date('2020-01-01'),
				ownerId: 1,
			};

			const mockOwner = { id: 1, name: 'John Doe' };
			const mockSpecies = { id: 1, name: 'Perro' };
			const mockPet = { id: 1, ...createPetDto, owner: mockOwner, species: mockSpecies };

			mockUsersService.findOne.mockResolvedValue(mockOwner);
			mockSpeciesService.findOne.mockResolvedValue(mockSpecies);
			mockPetRepository.create.mockReturnValue(mockPet);
			mockPetRepository.save.mockResolvedValue(mockPet);

			const result = await service.create(createPetDto);

			expect(mockUsersService.findOne).toHaveBeenCalledWith(createPetDto.ownerId);
			expect(mockSpeciesService.findOne).toHaveBeenCalledWith(createPetDto.speciesId);
			expect(mockPetRepository.create).toHaveBeenCalled();
			expect(mockPetRepository.save).toHaveBeenCalledWith(mockPet);
			expect(result).toEqual(mockPet);
		});
	});

	describe('findAll', () => {
		it('should return all pets', async () => {
			const mockPets = [
				{ id: 1, name: 'Buddy', gender: PetGender.MALE },
				{ id: 2, name: 'Bella', gender: PetGender.FEMALE },
			];

			mockPetRepository.find.mockResolvedValue(mockPets);

			const result = await service.findAll();

			expect(mockPetRepository.find).toHaveBeenCalledWith({
				relations: ['owner'],
			});
			expect(result).toEqual(mockPets);
		});
	});

	describe('findOne', () => {
		it('should return a pet by id', async () => {
			const mockPet = { id: 1, name: 'Buddy', gender: PetGender.MALE };

			mockPetRepository.findOne.mockResolvedValue(mockPet);

			const result = await service.findOne(1);

			expect(mockPetRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 },
				relations: ['owner', 'medicalRecords'],
			});
			expect(result).toEqual(mockPet);
		});

		it('should throw PetNotFoundException when pet not found', async () => {
			mockPetRepository.findOne.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(PetNotFoundException);
		});
	});

	describe('findByOwner', () => {
		it('should return pets by owner id', async () => {
			const mockPets = [
				{ id: 1, name: 'Buddy', ownerId: 1 },
				{ id: 2, name: 'Bella', ownerId: 1 },
			];

			mockUsersService.findOne.mockResolvedValue({ id: 1, name: 'John' });
			mockPetRepository.find.mockResolvedValue(mockPets);

			const result = await service.findByOwner(1);

			expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
			expect(mockPetRepository.find).toHaveBeenCalledWith({
				where: { owner: { id: 1 } },
				relations: ['owner'],
			});
			expect(result).toEqual(mockPets);
		});
	});

	describe('findBySpecies', () => {
		it('should return pets by species id', async () => {
			const mockPets = [
				{ id: 1, name: 'Buddy', speciesId: 1 },
				{ id: 2, name: 'Rex', speciesId: 1 },
			];

			mockSpeciesService.findOne.mockResolvedValue({ id: 1, name: 'Perro' });
			mockPetRepository.find.mockResolvedValue(mockPets);

			const result = await service.findBySpecies(1);

			expect(mockSpeciesService.findOne).toHaveBeenCalledWith(1);
			expect(mockPetRepository.find).toHaveBeenCalledWith({
				where: { species: { id: 1 } },
				relations: ['owner', 'species'],
			});
			expect(result).toEqual(mockPets);
		});
	});

	describe('update', () => {
		it('should update a pet successfully', async () => {
			const updatePetDto: UpdatePetDto = {
				name: 'Buddy Updated',
				breed: 'Golden Retriever Updated',
			};

			const existingPet = { id: 1, name: 'Buddy', breed: 'Golden Retriever' };
			const updatedPet = { ...existingPet, ...updatePetDto };

			mockPetRepository.findOne.mockResolvedValue(updatedPet);
			mockPetRepository.update.mockResolvedValue({ affected: 1 });

			const result = await service.update(1, updatePetDto);

			expect(mockPetRepository.update).toHaveBeenCalledWith(1, updatePetDto);
			expect(result).toEqual(updatedPet);
		});

		it('should update pet with new species', async () => {
			const updatePetDto: UpdatePetDto = {
				name: 'Buddy Updated',
				speciesId: 2,
			};

			const mockSpecies = { id: 2, name: 'Gato' };
			const updatedPet = { id: 1, name: 'Buddy Updated', species: mockSpecies };

			mockSpeciesService.findOne.mockResolvedValue(mockSpecies);
			mockPetRepository.update.mockResolvedValue({ affected: 1 });
			mockPetRepository.findOne.mockResolvedValue(updatedPet);

			const result = await service.update(1, updatePetDto);

			expect(mockSpeciesService.findOne).toHaveBeenCalledWith(2);
			expect(mockPetRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
				name: 'Buddy Updated',
				species: mockSpecies,
			}));
			expect(result).toEqual(updatedPet);
		});

		it('should throw PetNotFoundException when updating non-existent pet', async () => {
			const updatePetDto: UpdatePetDto = { name: 'New Name' };

			mockPetRepository.update.mockResolvedValue({ affected: 0 });

			await expect(service.update(999, updatePetDto)).rejects.toThrow(PetNotFoundException);
		});
	});

	describe('removeById', () => {
		it('should soft delete a pet successfully', async () => {
			mockPetRepository.softDelete.mockResolvedValue({ affected: 1 });

			await service.removeById(1);

			expect(mockPetRepository.softDelete).toHaveBeenCalledWith({ id: 1 });
		});

		it('should throw PetNotFoundException when removing non-existent pet', async () => {
			mockPetRepository.softDelete.mockResolvedValue({ affected: 0 });

			await expect(service.removeById(999)).rejects.toThrow(PetNotFoundException);
		});
	});
});