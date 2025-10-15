import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecordNotFoundException } from '../../common/exceptions';
import { UsersService } from '../../core/auth/users/users.service';
import { PetsService } from '../pets/pets.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecord, PetSize } from './entities/medical-record.entity';
import { MedicalRecordsService } from './medical-records.service';

describe('MedicalRecordsService', () => {
	let service: MedicalRecordsService;
	let repository: Repository<MedicalRecord>;
	let petsService: PetsService;
	let usersService: UsersService;

	const mockMedicalRecordRepository = {
		create: jest.fn(),
		save: jest.fn(),
		find: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		softDelete: jest.fn(),
	};

	const mockPetsService = {
		findOne: jest.fn(),
	};

	const mockUsersService = {
		findOne: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MedicalRecordsService,
				{
					provide: getRepositoryToken(MedicalRecord),
					useValue: mockMedicalRecordRepository,
				},
				{
					provide: PetsService,
					useValue: mockPetsService,
				},
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
			],
		}).compile();

		service = module.get<MedicalRecordsService>(MedicalRecordsService);
		repository = module.get<Repository<MedicalRecord>>(getRepositoryToken(MedicalRecord));
		petsService = module.get<PetsService>(PetsService);
		usersService = module.get<UsersService>(UsersService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new medical record successfully', async () => {
			const createMedicalRecordDto: CreateMedicalRecordDto = {
				petId: 1,
				veterinarianId: 1,
				openingDate: new Date('2024-01-15'),
				weight: 25.5,
				size: PetSize.MEDIUM,
				allergies: 'Ninguna alergia conocida',
				medications: 'Ninguna medicación actual',
				vaccinationStatus: 'Vacunas al día',
			};

			const mockPet = { id: 1, name: 'Firulais' };
			const mockVeterinarian = { id: 1, name: 'Dr. García' };
			const mockMedicalRecord = { id: 1, ...createMedicalRecordDto };

			mockPetsService.findOne.mockResolvedValue(mockPet);
			mockUsersService.findOne.mockResolvedValue(mockVeterinarian);
			mockMedicalRecordRepository.create.mockReturnValue(mockMedicalRecord);
			mockMedicalRecordRepository.save.mockResolvedValue(mockMedicalRecord);

			const result = await service.create(createMedicalRecordDto);

			expect(petsService.findOne).toHaveBeenCalledWith(createMedicalRecordDto.petId);
			expect(usersService.findOne).toHaveBeenCalledWith(createMedicalRecordDto.veterinarianId);
			expect(mockMedicalRecordRepository.create).toHaveBeenCalledWith({
				...createMedicalRecordDto,
				pet: mockPet,
				veterinarian: mockVeterinarian,
			});
			expect(mockMedicalRecordRepository.save).toHaveBeenCalledWith(mockMedicalRecord);
			expect(result).toEqual(mockMedicalRecord);
		});
	});

	describe('findAll', () => {
		it('should return all medical records', async () => {
			const mockMedicalRecords = [
				{ id: 1, weight: 25.5, allergies: 'Ninguna', petId: 1, veterinarianId: 1 },
				{ id: 2, weight: 30, allergies: 'Alergia al pollo', petId: 2, veterinarianId: 1 },
			];

			mockMedicalRecordRepository.find.mockResolvedValue(mockMedicalRecords);

			const result = await service.findAll();

			expect(mockMedicalRecordRepository.find).toHaveBeenCalledWith({
				relations: ['pet', 'veterinarian', 'diagnostics']
			});
			expect(result).toEqual(mockMedicalRecords);
		});
	});

	describe('findOne', () => {
		it('should return a medical record by id', async () => {
			const mockMedicalRecord = { id: 1, description: 'Chequeo médico' };

			mockMedicalRecordRepository.findOne.mockResolvedValue(mockMedicalRecord);

			const result = await service.findOne(1);

			expect(mockMedicalRecordRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 },
				relations: ['pet', 'veterinarian', 'diagnostics'],
			});
			expect(result).toEqual(mockMedicalRecord);
		});

		it('should throw MedicalRecordNotFoundException when not found', async () => {
			mockMedicalRecordRepository.findOne.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(MedicalRecordNotFoundException);
		});
	});

	describe('findByPet', () => {
		it('should return medical records for a specific pet', async () => {
			const mockMedicalRecords = [
				{ id: 1, petId: 1, weight: 25.5, allergies: 'Ninguna' },
				{ id: 2, petId: 1, weight: 30, allergies: 'Alergia al pollo' },
			];

			mockPetsService.findOne.mockResolvedValue({ id: 1, name: 'Firulais' });
			mockMedicalRecordRepository.find.mockResolvedValue(mockMedicalRecords);

			const result = await service.findByPet(1);

			expect(petsService.findOne).toHaveBeenCalledWith(1);
			expect(mockMedicalRecordRepository.find).toHaveBeenCalledWith({
				where: { pet: { id: 1 } },
				relations: ['pet', 'veterinarian', 'diagnostics'],
				order: { openingDate: 'DESC' },
			});
			expect(result).toEqual(mockMedicalRecords);
		});
	});

	describe('findByVeterinarian', () => {
		it('should return medical records for a specific veterinarian', async () => {
			const mockMedicalRecords = [
				{ id: 1, veterinarianId: 1, weight: 25.5, allergies: 'Ninguna' },
				{ id: 2, veterinarianId: 1, weight: 30, allergies: 'Alergia al pollo' },
			];

			mockUsersService.findOne.mockResolvedValue({ id: 1, name: 'Dr. García' });
			mockMedicalRecordRepository.find.mockResolvedValue(mockMedicalRecords);

			const result = await service.findByVeterinarian(1);

			expect(usersService.findOne).toHaveBeenCalledWith(1);
			expect(mockMedicalRecordRepository.find).toHaveBeenCalledWith({
				where: { veterinarian: { id: 1 } },
				relations: ['pet', 'veterinarian', 'diagnostics'],
				order: { openingDate: 'DESC' },
			});
			expect(result).toEqual(mockMedicalRecords);
		});
	});

	describe('update', () => {
		it('should update a medical record successfully', async () => {
			const updateMedicalRecordDto: UpdateMedicalRecordDto = {
				weight: 30.0,
				allergies: 'Alergia al pollo',
			};

			const updatedRecord = { id: 1, weight: 30.0, allergies: 'Alergia al pollo' };

			mockMedicalRecordRepository.update.mockResolvedValue({ affected: 1 });
			mockMedicalRecordRepository.findOne.mockResolvedValue(updatedRecord);

			const result = await service.update(1, updateMedicalRecordDto);

			expect(mockMedicalRecordRepository.update).toHaveBeenCalledWith(1, updateMedicalRecordDto);
			expect(result).toEqual(updatedRecord);
		});

		it('should throw MedicalRecordNotFoundException when updating non-existent record', async () => {
			mockMedicalRecordRepository.update.mockResolvedValue({ affected: 0 });

			await expect(service.update(999, {})).rejects.toThrow(MedicalRecordNotFoundException);
		});
	});

	describe('removeById', () => {
		it('should soft delete a medical record successfully', async () => {
			mockMedicalRecordRepository.softDelete.mockResolvedValue({ affected: 1 });

			await service.removeById(1);

			expect(mockMedicalRecordRepository.softDelete).toHaveBeenCalledWith({ id: 1 });
		});

		it('should throw MedicalRecordNotFoundException when removing non-existent record', async () => {
			mockMedicalRecordRepository.softDelete.mockResolvedValue({ affected: 0 });

			await expect(service.removeById(999)).rejects.toThrow(MedicalRecordNotFoundException);
		});
	});
});