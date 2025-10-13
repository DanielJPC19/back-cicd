import { Test, TestingModule } from '@nestjs/testing';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PetSize } from './entities/medical-record.entity';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';

describe('MedicalRecordsController', () => {
	let controller: MedicalRecordsController;
	let service: MedicalRecordsService;

	const mockMedicalRecordsService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findByPet: jest.fn(),
		findByVeterinarian: jest.fn(),
		update: jest.fn(),
		removeById: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MedicalRecordsController],
			providers: [
				{
					provide: MedicalRecordsService,
					useValue: mockMedicalRecordsService,
				},
			],
		}).compile();

		controller = module.get<MedicalRecordsController>(MedicalRecordsController);
		service = module.get<MedicalRecordsService>(MedicalRecordsService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new medical record', async () => {
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

			const mockResult = { id: 1, ...createMedicalRecordDto };
			mockMedicalRecordsService.create.mockResolvedValue(mockResult);

			const result = await controller.create(createMedicalRecordDto);

			expect(service.create).toHaveBeenCalledWith(createMedicalRecordDto);
			expect(result).toEqual(mockResult);
		});
	});

	describe('findAll', () => {
		it('should return all medical records', async () => {
			const mockMedicalRecords = [
				{ id: 1, description: 'Chequeo 1', petId: 1, veterinarianId: 1 },
				{ id: 2, description: 'Chequeo 2', petId: 2, veterinarianId: 1 },
			];

			mockMedicalRecordsService.findAll.mockResolvedValue(mockMedicalRecords);

			const result = await controller.findAll();

			expect(service.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockMedicalRecords);
		});
	});

	describe('findOne', () => {
		it('should return a medical record by id', async () => {
			const mockMedicalRecord = { id: 1, description: 'Chequeo médico' };

			mockMedicalRecordsService.findOne.mockResolvedValue(mockMedicalRecord);

			const result = await controller.findOne(1);

			expect(service.findOne).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockMedicalRecord);
		});
	});

	describe('findByPet', () => {
		it('should return medical records for a specific pet', async () => {
			const mockMedicalRecords = [
				{ id: 1, petId: 1, description: 'Chequeo 1' },
				{ id: 2, petId: 1, description: 'Chequeo 2' },
			];

			mockMedicalRecordsService.findByPet.mockResolvedValue(mockMedicalRecords);

			const result = await controller.findByPet(1);

			expect(service.findByPet).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockMedicalRecords);
		});
	});

	describe('findByVeterinarian', () => {
		it('should return medical records for a specific veterinarian', async () => {
			const mockMedicalRecords = [
				{ id: 1, veterinarianId: 1, description: 'Chequeo 1' },
				{ id: 2, veterinarianId: 1, description: 'Chequeo 2' },
			];

			mockMedicalRecordsService.findByVeterinarian.mockResolvedValue(mockMedicalRecords);

			const result = await controller.findByVeterinarian(1);

			expect(service.findByVeterinarian).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockMedicalRecords);
		});
	});

	describe('update', () => {
		it('should update a medical record', async () => {
			const updateMedicalRecordDto: UpdateMedicalRecordDto = {
				weight: 30.0,
			};

			const mockResult = { id: 1, weight: 30.0 };
			mockMedicalRecordsService.update.mockResolvedValue(mockResult);

			const result = await controller.update(1, updateMedicalRecordDto);

			expect(service.update).toHaveBeenCalledWith(1, updateMedicalRecordDto);
			expect(result).toEqual(mockResult);
		});
	});

	describe('removeById', () => {
		it('should remove a medical record', async () => {
			mockMedicalRecordsService.removeById.mockResolvedValue(undefined);

			await controller.removeById(1);

			expect(service.removeById).toHaveBeenCalledWith(1);
		});
	});
});