import { DiagnosticType } from '../../../catalogs/diagnostic-types/entities/diagnostic-type.entity';
import { User } from '../../../core/auth/entities/user.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
import { Diagnostic, DiagnosticSeverity } from './diagnostic.entity';

describe('Diagnostic Entity', () => {
	let diagnostic: Diagnostic;

	beforeEach(() => {
		diagnostic = new Diagnostic();
	});

	it('should be defined', () => {
		expect(diagnostic).toBeDefined();
	});

	it('should create a diagnostic with all properties', () => {
		const diagnosticType = new DiagnosticType();
		diagnosticType.id = 1;
		diagnosticType.name = 'Examen de Sangre';

		const medicalRecord = new MedicalRecord();
		medicalRecord.id = 1;

		const veterinarian = new User();
		veterinarian.id = 1;
		veterinarian.firstName = 'Dr. García';

		diagnostic.id = 1;
		diagnostic.type = diagnosticType;
		diagnostic.visitDate = new Date('2023-01-15');
		diagnostic.reason = 'Chequeo rutinario';
		diagnostic.symptoms = 'Ninguno';
		diagnostic.examination = 'Resultados normales';
		diagnostic.severity = DiagnosticSeverity.LOW;
		diagnostic.recommendations = 'Continuar con cuidados regulares';
		diagnostic.createdAt = new Date();
		diagnostic.updatedAt = new Date();
		diagnostic.medicalRecord = medicalRecord;
		diagnostic.veterinarian = veterinarian;

		expect(diagnostic.id).toBe(1);
		expect(diagnostic.type).toBe(diagnosticType);
		expect(diagnostic.visitDate).toBeInstanceOf(Date);
		expect(diagnostic.reason).toBe('Chequeo rutinario');
		expect(diagnostic.symptoms).toBe('Ninguno');
		expect(diagnostic.examination).toBe('Resultados normales');
		expect(diagnostic.severity).toBe(DiagnosticSeverity.LOW);
		expect(diagnostic.recommendations).toBe('Continuar con cuidados regulares');
		expect(diagnostic.createdAt).toBeInstanceOf(Date);
		expect(diagnostic.updatedAt).toBeInstanceOf(Date);
		expect(diagnostic.medicalRecord).toBe(medicalRecord);
		expect(diagnostic.veterinarian).toBe(veterinarian);
	});

	it('should handle diagnostic type relationship', () => {
		const diagnosticType = new DiagnosticType();
		diagnosticType.id = 2;
		diagnosticType.name = 'Radiografía';
    
		diagnostic.type = diagnosticType;
    
		expect(diagnostic.type).toBe(diagnosticType);
		expect(diagnostic.type.id).toBe(2);
		expect(diagnostic.type.name).toBe('Radiografía');
	});

	it('should handle medical record relationship', () => {
		const medicalRecord = new MedicalRecord();
		medicalRecord.id = 5;
    
		diagnostic.medicalRecord = medicalRecord;
    
		expect(diagnostic.medicalRecord).toBe(medicalRecord);
		expect(diagnostic.medicalRecord.id).toBe(5);
	});

	it('should handle veterinarian relationship', () => {
		const veterinarian = new User();
		veterinarian.id = 10;
		veterinarian.firstName = 'Dra. Martínez';
		veterinarian.lastName = 'López';
    
		diagnostic.veterinarian = veterinarian;
    
		expect(diagnostic.veterinarian).toBe(veterinarian);
		expect(diagnostic.veterinarian.id).toBe(10);
		expect(diagnostic.veterinarian.firstName).toBe('Dra. Martínez');
	});

	it('should handle soft delete', () => {
		const deletionDate = new Date();
		diagnostic.deletedAt = deletionDate;

		expect(diagnostic.deletedAt).toBe(deletionDate);
	});

	it('should handle severity levels', () => {
		diagnostic.severity = DiagnosticSeverity.CRITICAL;
		expect(diagnostic.severity).toBe(DiagnosticSeverity.CRITICAL);
    
		diagnostic.severity = DiagnosticSeverity.HIGH;
		expect(diagnostic.severity).toBe(DiagnosticSeverity.HIGH);
	});
});