import { Diagnostic } from '../../../clinic/diagnostics/entities/diagnostic.entity';
import { DiagnosticType } from './diagnostic-type.entity';

describe('DiagnosticType Entity', () => {
	let diagnosticType: DiagnosticType;

	beforeEach(() => {
		diagnosticType = new DiagnosticType();
	});

	it('should be defined', () => {
		expect(diagnosticType).toBeDefined();
	});

	it('should create a diagnostic type with all properties', () => {
		diagnosticType.id = 1;
		diagnosticType.name = 'Examen de Sangre';
		diagnosticType.isDeleted = false;
		diagnosticType.createdAt = new Date();
		diagnosticType.updatedAt = new Date();

		expect(diagnosticType.id).toBe(1);
		expect(diagnosticType.name).toBe('Examen de Sangre');
		expect(diagnosticType.isDeleted).toBe(false);
		expect(diagnosticType.createdAt).toBeInstanceOf(Date);
		expect(diagnosticType.updatedAt).toBeInstanceOf(Date);
	});

	it('should handle diagnostics relationship', () => {
		const diagnostic1 = new Diagnostic();
		diagnostic1.id = 1;
		diagnostic1.reason = 'Resultado normal';

		const diagnostic2 = new Diagnostic();
		diagnostic2.id = 2;
		diagnostic2.reason = 'Resultado alterado';

		diagnosticType.diagnostics = [diagnostic1, diagnostic2];

		expect(diagnosticType.diagnostics).toHaveLength(2);
		expect(diagnosticType.diagnostics[0]).toBe(diagnostic1);
		expect(diagnosticType.diagnostics[1]).toBe(diagnostic2);
	});

	it('should handle empty diagnostics array', () => {
		diagnosticType.diagnostics = [];
		expect(diagnosticType.diagnostics).toHaveLength(0);
	});

	it('should handle soft delete with isDeleted flag', () => {
		diagnosticType.isDeleted = true;
		expect(diagnosticType.isDeleted).toBe(true);
    
		diagnosticType.isDeleted = false;
		expect(diagnosticType.isDeleted).toBe(false);
	});

	it('should handle soft delete with deletedAt', () => {
		const deletionDate = new Date();
		diagnosticType.deletedAt = deletionDate;

		expect(diagnosticType.deletedAt).toBe(deletionDate);
	});
});