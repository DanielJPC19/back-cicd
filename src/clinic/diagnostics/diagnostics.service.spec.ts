import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticTypesService } from '../../catalogs/diagnostic-types/diagnostic-types.service';
import { DiagnosticNotFoundException } from '../../common/exceptions';
import { UsersService } from '../../core/auth/users/users.service';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { DiagnosticsService } from './diagnostics.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { UpdateDiagnosticDto } from './dto/update-diagnostic.dto';
import { Diagnostic, DiagnosticSeverity } from './entities/diagnostic.entity';

describe('DiagnosticsService', () => {
	let service: DiagnosticsService;
	let mockDiagnosticRepository: Partial<Repository<Diagnostic>>;
	let mockMedicalRecordsService: Partial<MedicalRecordsService>;
	let mockUsersService: Partial<UsersService>;
	let mockDiagnosticTypesService: Partial<DiagnosticTypesService>;

	beforeEach(async () => {
		mockDiagnosticRepository = {
			create: jest.fn() as jest.MockedFunction<any>,
			save: jest.fn() as jest.MockedFunction<any>,
			find: jest.fn() as jest.MockedFunction<any>,
			findOne: jest.fn() as jest.MockedFunction<any>,
			update: jest.fn() as jest.MockedFunction<any>,
			softDelete: jest.fn() as jest.MockedFunction<any>,
		};

		mockMedicalRecordsService = {
			findOne: jest.fn() as jest.MockedFunction<any>,
		};

		mockUsersService = {
			findOne: jest.fn() as jest.MockedFunction<any>,
		};

		mockDiagnosticTypesService = {
			findOne: jest.fn() as jest.MockedFunction<any>,
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DiagnosticsService,
				{
					provide: getRepositoryToken(Diagnostic),
					useValue: mockDiagnosticRepository,
				},
				{
					provide: MedicalRecordsService,
					useValue: mockMedicalRecordsService,
				},
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
				{
					provide: DiagnosticTypesService,
					useValue: mockDiagnosticTypesService,
				},
			],
		}).compile();

		service = module.get<DiagnosticsService>(DiagnosticsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a new diagnostic successfully', async () => {
			const createDiagnosticDto: CreateDiagnosticDto = {
				medicalRecordId: 1,
				veterinarianId: 1,
				diagnosticTypeId: 1,
				visitDate: new Date('2024-10-15'),
				reason: 'Revisión de rutina',
				symptoms: 'Letargo',
				examination: 'Examen físico normal',
				severity: DiagnosticSeverity.MODERATE,
				recommendations: 'Reposo por 7 días',
			};

			const mockMedicalRecord = { id: 1, pet: { id: 1, name: 'Firulais' } };
			const mockVeterinarian = { id: 1, name: 'Dr. García' };
			const mockDiagnosticType = { id: 1, name: 'Examen de rutina' };
			const mockDiagnostic = { id: 1, ...createDiagnosticDto };

			mockMedicalRecordsService.findOne.mockResolvedValue(mockMedicalRecord);
			mockUsersService.findOne.mockResolvedValue(mockVeterinarian);
			mockDiagnosticTypesService.findOne.mockResolvedValue(mockDiagnosticType);
			mockDiagnosticRepository.create.mockReturnValue(mockDiagnostic);
			mockDiagnosticRepository.save.mockResolvedValue(mockDiagnostic);

			const result = await service.create(createDiagnosticDto);

			expect(mockMedicalRecordsService.findOne).toHaveBeenCalledWith(1);
			expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
			expect(mockDiagnosticTypesService.findOne).toHaveBeenCalledWith(1);
			expect(mockDiagnosticRepository.create).toHaveBeenCalled();
			expect(mockDiagnosticRepository.save).toHaveBeenCalledWith(mockDiagnostic);
			expect(result).toEqual(mockDiagnostic);
		});
	});

	describe('findAll', () => {
		it('should return all diagnostics', async () => {
			const mockDiagnostics = [
				{ id: 1, reason: 'Revisión de rutina', severity: DiagnosticSeverity.LOW },
				{ id: 2, reason: 'Síntomas preocupantes', severity: DiagnosticSeverity.HIGH },
			];

			mockDiagnosticRepository.find.mockResolvedValue(mockDiagnostics);

			const result = await service.findAll();

			expect(mockDiagnosticRepository.find).toHaveBeenCalledWith({
				relations: ['medicalRecord', 'veterinarian'],
			});
			expect(result).toEqual(mockDiagnostics);
		});
	});

	describe('findOne', () => {
		it('should return a diagnostic by id', async () => {
			const mockDiagnostic = { 
				id: 1, 
				reason: 'Revisión de rutina', 
				severity: DiagnosticSeverity.LOW 
			};

			mockDiagnosticRepository.findOne.mockResolvedValue(mockDiagnostic);

			const result = await service.findOne(1);

			expect(mockDiagnosticRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 },
				relations: ['medicalRecord', 'veterinarian', 'medicalRecord.pet'],
			});
			expect(result).toEqual(mockDiagnostic);
		});

		it('should throw DiagnosticNotFoundException when not found', async () => {
			mockDiagnosticRepository.findOne.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(DiagnosticNotFoundException);
		});
	});

	describe('findByMedicalRecord', () => {
		it('should return diagnostics for a specific medical record', async () => {
			const mockDiagnostics = [
				{ id: 1, medicalRecordId: 1, reason: 'Revisión 1' },
				{ id: 2, medicalRecordId: 1, reason: 'Revisión 2' },
			];

			mockMedicalRecordsService.findOne.mockResolvedValue({ id: 1 });
			mockDiagnosticRepository.find.mockResolvedValue(mockDiagnostics);

			const result = await service.findByMedicalRecord(1);

			expect(mockMedicalRecordsService.findOne).toHaveBeenCalledWith(1);
			expect(mockDiagnosticRepository.find).toHaveBeenCalledWith({
				where: { medicalRecord: { id: 1 } },
				relations: ['medicalRecord', 'veterinarian'],
				order: { createdAt: 'DESC' },
			});
			expect(result).toEqual(mockDiagnostics);
		});
	});

	describe('findByVeterinarian', () => {
		it('should return diagnostics for a specific veterinarian', async () => {
			const mockDiagnostics = [
				{ id: 1, veterinarianId: 1, reason: 'Diagnóstico 1' },
				{ id: 2, veterinarianId: 1, reason: 'Diagnóstico 2' },
			];

			mockUsersService.findOne.mockResolvedValue({ id: 1, name: 'Dr. García' });
			mockDiagnosticRepository.find.mockResolvedValue(mockDiagnostics);

			const result = await service.findByVeterinarian(1);

			expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
			expect(mockDiagnosticRepository.find).toHaveBeenCalledWith({
				where: { veterinarian: { id: 1 } },
				relations: ['medicalRecord', 'veterinarian', 'medicalRecord.pet'],
				order: { createdAt: 'DESC' },
			});
			expect(result).toEqual(mockDiagnostics);
		});
	});

	describe('findBySeverity', () => {
		it('should return diagnostics by severity', async () => {
			const mockDiagnostics = [
				{ id: 1, severity: DiagnosticSeverity.HIGH, reason: 'Grave' },
			];

			mockDiagnosticRepository.find.mockResolvedValue(mockDiagnostics);

			const result = await service.findBySeverity('HIGH');

			expect(mockDiagnosticRepository.find).toHaveBeenCalledWith({
				where: { severity: 'HIGH' },
				relations: ['medicalRecord', 'veterinarian', 'medicalRecord.pet'],
				order: { createdAt: 'DESC' },
			});
			expect(result).toEqual(mockDiagnostics);
		});
	});

	describe('findByPet', () => {
		it('should return diagnostics for a specific pet', async () => {
			const mockDiagnostics = [
				{ id: 1, reason: 'Diagnóstico pet 1' },
				{ id: 2, reason: 'Diagnóstico pet 2' },
			];

			mockDiagnosticRepository.find.mockResolvedValue(mockDiagnostics);

			const result = await service.findByPet(1);

			expect(mockDiagnosticRepository.find).toHaveBeenCalledWith({
				where: { medicalRecord: { pet: { id: 1 } } },
				relations: ['medicalRecord', 'veterinarian', 'medicalRecord.pet'],
				order: { createdAt: 'DESC' },
			});
			expect(result).toEqual(mockDiagnostics);
		});
	});

	describe('update', () => {
		it('should update a diagnostic successfully', async () => {
			const updateDiagnosticDto: UpdateDiagnosticDto = {
				reason: 'Nuevo motivo',
				severity: DiagnosticSeverity.HIGH,
			};

			const updatedDiagnostic = { id: 1, ...updateDiagnosticDto };

			mockDiagnosticRepository.update.mockResolvedValue({ affected: 1 });
			mockDiagnosticRepository.findOne.mockResolvedValue(updatedDiagnostic);

			const result = await service.update(1, updateDiagnosticDto);

			expect(mockDiagnosticRepository.update).toHaveBeenCalledWith(1, updateDiagnosticDto);
			expect(result).toEqual(updatedDiagnostic);
		});

		it('should throw DiagnosticNotFoundException when updating non-existent diagnostic', async () => {
			mockDiagnosticRepository.update.mockResolvedValue({ affected: 0 });

			await expect(service.update(999, {})).rejects.toThrow(DiagnosticNotFoundException);
		});

		it('should validate diagnostic type when provided in update', async () => {
			const updateDto = { diagnosticTypeId: 2 };

			mockDiagnosticTypesService.findOne.mockResolvedValue({ id: 2, name: 'Nuevo tipo' });
			mockDiagnosticRepository.update.mockResolvedValue({ affected: 1 });
			mockDiagnosticRepository.findOne.mockResolvedValue({ id: 1, ...updateDto });

			await service.update(1, updateDto);

			expect(mockDiagnosticTypesService.findOne).toHaveBeenCalledWith(2);
		});
	});

	describe('removeById', () => {
		it('should soft delete a diagnostic successfully', async () => {
			mockDiagnosticRepository.softDelete.mockResolvedValue({ affected: 1 });

			await service.removeById(1);

			expect(mockDiagnosticRepository.softDelete).toHaveBeenCalledWith({ id: 1 });
		});

		it('should throw DiagnosticNotFoundException when removing non-existent diagnostic', async () => {
			mockDiagnosticRepository.softDelete.mockResolvedValue({ affected: 0 });

			await expect(service.removeById(999)).rejects.toThrow(DiagnosticNotFoundException);
		});
	});
});