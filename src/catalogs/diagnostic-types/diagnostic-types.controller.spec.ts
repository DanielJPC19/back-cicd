import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticTypesController } from './diagnostic-types.controller';
import { DiagnosticTypesService } from './diagnostic-types.service';
import { CreateDiagnosticTypeDto } from './dto/create-diagnostic-type.dto';
import { UpdateDiagnosticTypeDto } from './dto/update-diagnostic-type.dto';

describe('DiagnosticTypesController', () => {
	let controller: DiagnosticTypesController;
	let service: DiagnosticTypesService;

	const mockDiagnosticTypesService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [DiagnosticTypesController],
			providers: [
				{
					provide: DiagnosticTypesService,
					useValue: mockDiagnosticTypesService,
				},
			],
		}).compile();

		controller = module.get<DiagnosticTypesController>(DiagnosticTypesController);
		service = module.get<DiagnosticTypesService>(DiagnosticTypesService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new diagnostic type', async () => {
			const createDiagnosticTypeDto: CreateDiagnosticTypeDto = {
				name: 'Radiografía',
			};

			const mockResult = { id: 1, ...createDiagnosticTypeDto };
			mockDiagnosticTypesService.create.mockResolvedValue(mockResult);

			const result = await controller.create(createDiagnosticTypeDto);

			expect(service.create).toHaveBeenCalledWith(createDiagnosticTypeDto);
			expect(result).toEqual(mockResult);
		});
	});

	describe('findAll', () => {
		it('should return all diagnostic types', async () => {
			const mockDiagnosticTypes = [
				{ id: 1, name: 'Radiografía' },
				{ id: 2, name: 'Ecografía' },
			];

			mockDiagnosticTypesService.findAll.mockResolvedValue(mockDiagnosticTypes);

			const result = await controller.findAll();

			expect(service.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockDiagnosticTypes);
		});
	});

	describe('findOne', () => {
		it('should return a diagnostic type by id', async () => {
			const mockDiagnosticType = { id: 1, name: 'Radiografía' };

			mockDiagnosticTypesService.findOne.mockResolvedValue(mockDiagnosticType);

			const result = await controller.findOne(1);

			expect(service.findOne).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockDiagnosticType);
		});
	});

	describe('update', () => {
		it('should update a diagnostic type', async () => {
			const updateDiagnosticTypeDto: UpdateDiagnosticTypeDto = {
				name: 'Radiografía Actualizada',
			};

			const mockResult = { id: 1, name: 'Radiografía Actualizada' };
			mockDiagnosticTypesService.update.mockResolvedValue(mockResult);

			const result = await controller.update(1, updateDiagnosticTypeDto);

			expect(service.update).toHaveBeenCalledWith(1, updateDiagnosticTypeDto);
			expect(result).toEqual(mockResult);
		});
	});

	describe('remove', () => {
		it('should remove a diagnostic type', async () => {
			mockDiagnosticTypesService.remove.mockResolvedValue(undefined);

			await controller.remove(1);

			expect(service.remove).toHaveBeenCalledWith(1);
		});
	});
});