import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { UpdateDiagnosticDto } from './dto/update-diagnostic.dto';
import { DiagnosticSeverity } from './entities/diagnostic.entity';

describe('DiagnosticsController', () => {
	let controller: DiagnosticsController;
	let diagnosticsService: DiagnosticsService;

	const mockDiagnosticsService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findByMedicalRecord: jest.fn(),
		findByVeterinarian: jest.fn(),
		findByPet: jest.fn(),
		findBySeverity: jest.fn(),
		update: jest.fn(),
		removeById: jest.fn(),
	};

	beforeEach(async () => {

		const module: TestingModule = await Test.createTestingModule({
			controllers: [DiagnosticsController],
			providers: [
				{
					provide: DiagnosticsService,
					useValue: mockDiagnosticsService,
				},
			],
		}).compile();

		controller = module.get<DiagnosticsController>(DiagnosticsController);
		diagnosticsService = module.get<DiagnosticsService>(DiagnosticsService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('create', () => {
		it('should create a new diagnostic', async () => {
			const createDiagnosticDto: CreateDiagnosticDto = {
				medicalRecordId: 1,
				veterinarianId: 1,
				diagnosticTypeId: 1,
				visitDate: new Date('2024-10-15'),
				reason: 'Revisión de rutina',
				severity: DiagnosticSeverity.LOW,
			};

			const expectedResult = { id: 1, ...createDiagnosticDto };

			mockDiagnosticsService.create.mockResolvedValue(expectedResult);

			const result = await controller.create(createDiagnosticDto);

			expect(mockDiagnosticsService.create).toHaveBeenCalledWith(createDiagnosticDto);
			expect(result).toEqual(expectedResult);
		});
	});

	describe('findAll', () => {
		it('should return all diagnostics when no severity filter', async () => {
			const expectedDiagnostics = [
				{ id: 1, reason: 'Test 1', severity: DiagnosticSeverity.LOW },
				{ id: 2, reason: 'Test 2', severity: DiagnosticSeverity.HIGH },
			];

			mockDiagnosticsService.findAll.mockResolvedValue(expectedDiagnostics);

			const result = await controller.findAll();

			expect(mockDiagnosticsService.findAll).toHaveBeenCalled();
			expect(result).toEqual(expectedDiagnostics);
		});

		it('should return diagnostics filtered by severity', async () => {
			const expectedDiagnostics = [
				{ id: 1, reason: 'High severity', severity: DiagnosticSeverity.HIGH },
			];

			mockDiagnosticsService.findBySeverity.mockResolvedValue(expectedDiagnostics);

			const result = await controller.findAll('HIGH');

			expect(mockDiagnosticsService.findBySeverity).toHaveBeenCalledWith('HIGH');
			expect(result).toEqual(expectedDiagnostics);
		});
	});

	describe('findOne', () => {
		it('should return a diagnostic by id', async () => {
			const expectedDiagnostic = { 
				id: 1, 
				reason: 'Test diagnostic', 
				severity: DiagnosticSeverity.MODERATE 
			};

			mockDiagnosticsService.findOne.mockResolvedValue(expectedDiagnostic);

			const result = await controller.findOne(1);

			expect(mockDiagnosticsService.findOne).toHaveBeenCalledWith(1);
			expect(result).toEqual(expectedDiagnostic);
		});
	});

	describe('findByMedicalRecord', () => {
		it('should return diagnostics for a medical record', async () => {
			const expectedDiagnostics = [
				{ id: 1, medicalRecordId: 1, reason: 'Test 1' },
				{ id: 2, medicalRecordId: 1, reason: 'Test 2' },
			];

			mockDiagnosticsService.findByMedicalRecord.mockResolvedValue(expectedDiagnostics);

			const result = await controller.findByMedicalRecord(1);

			expect(mockDiagnosticsService.findByMedicalRecord).toHaveBeenCalledWith(1);
			expect(result).toEqual(expectedDiagnostics);
		});
	});

	describe('findByVeterinarian', () => {
		it('should return diagnostics for a veterinarian', async () => {
			const expectedDiagnostics = [
				{ id: 1, veterinarianId: 1, reason: 'Test 1' },
				{ id: 2, veterinarianId: 1, reason: 'Test 2' },
			];

			mockDiagnosticsService.findByVeterinarian.mockResolvedValue(expectedDiagnostics);

			const result = await controller.findByVeterinarian(1);

			expect(mockDiagnosticsService.findByVeterinarian).toHaveBeenCalledWith(1);
			expect(result).toEqual(expectedDiagnostics);
		});
	});

	describe('findByPet', () => {
		it('should return diagnostics for a pet', async () => {
			const expectedDiagnostics = [
				{ id: 1, reason: 'Pet diagnostic 1' },
				{ id: 2, reason: 'Pet diagnostic 2' },
			];

			mockDiagnosticsService.findByPet.mockResolvedValue(expectedDiagnostics);

			const result = await controller.findByPet(1);

			expect(mockDiagnosticsService.findByPet).toHaveBeenCalledWith(1);
			expect(result).toEqual(expectedDiagnostics);
		});
	});

	describe('findBySeverityParam', () => {
		it('should return diagnostics by severity parameter', async () => {
			const expectedDiagnostics = [
				{ id: 1, severity: DiagnosticSeverity.HIGH, reason: 'Critical case' },
			];

			mockDiagnosticsService.findBySeverity.mockResolvedValue(expectedDiagnostics);

			const result = await controller.findBySeverityParam('HIGH');

			expect(mockDiagnosticsService.findBySeverity).toHaveBeenCalledWith('HIGH');
			expect(result).toEqual(expectedDiagnostics);
		});
	});

	describe('update', () => {
		it('should update a diagnostic', async () => {
			const updateDiagnosticDto: UpdateDiagnosticDto = {
				reason: 'Updated reason',
				severity: DiagnosticSeverity.HIGH,
			};

			const expectedResult = { id: 1, ...updateDiagnosticDto };

			mockDiagnosticsService.update.mockResolvedValue(expectedResult);

			const result = await controller.update(1, updateDiagnosticDto);

			expect(mockDiagnosticsService.update).toHaveBeenCalledWith(1, updateDiagnosticDto);
			expect(result).toEqual(expectedResult);
		});
	});

	describe('removeById', () => {
		it('should remove a diagnostic', async () => {
			mockDiagnosticsService.removeById.mockResolvedValue(undefined);

			await controller.removeById(1);

			expect(mockDiagnosticsService.removeById).toHaveBeenCalledWith(1);
		});
	});
});