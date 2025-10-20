import { User } from '../../../core/auth/entities/user.entity';
import { Diagnostic } from '../../diagnostics/entities/diagnostic.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { MedicalRecord, PetSize } from './medical-record.entity';

describe('MedicalRecord Entity', () => {
	let medicalRecord: MedicalRecord;

	beforeEach(() => {
		medicalRecord = new MedicalRecord();
	});

	it('should be defined', () => {
		expect(medicalRecord).toBeDefined();
	});

	it('should create a medical record with all properties', () => {
		const pet = new Pet();
		pet.id = 1;
		pet.name = 'Buddy';

		const veterinarian = new User();
		veterinarian.id = 1;
		veterinarian.firstName = 'Dr. García';

		medicalRecord.id = 1;
		medicalRecord.openingDate = new Date('2023-01-15');
		medicalRecord.weight = 25.5;
		medicalRecord.size = PetSize.MEDIUM;
		medicalRecord.allergies = 'Ninguna conocida';
		medicalRecord.medications = 'Vitaminas';
		medicalRecord.vaccinationStatus = 'Al día';
		medicalRecord.isDeleted = false;
		medicalRecord.createdAt = new Date();
		medicalRecord.updatedAt = new Date();
		medicalRecord.pet = pet;
		medicalRecord.veterinarian = veterinarian;

		expect(medicalRecord.id).toBe(1);
		expect(medicalRecord.openingDate).toBeInstanceOf(Date);
		expect(medicalRecord.weight).toBe(25.5);
		expect(medicalRecord.size).toBe(PetSize.MEDIUM);
		expect(medicalRecord.allergies).toBe('Ninguna conocida');
		expect(medicalRecord.medications).toBe('Vitaminas');
		expect(medicalRecord.vaccinationStatus).toBe('Al día');
		expect(medicalRecord.isDeleted).toBe(false);
		expect(medicalRecord.createdAt).toBeInstanceOf(Date);
		expect(medicalRecord.updatedAt).toBeInstanceOf(Date);
		expect(medicalRecord.pet).toBe(pet);
		expect(medicalRecord.veterinarian).toBe(veterinarian);
	});

	it('should handle pet relationship', () => {
		const pet = new Pet();
		pet.id = 5;
		pet.name = 'Luna';
    
		medicalRecord.pet = pet;
    
		expect(medicalRecord.pet).toBe(pet);
		expect(medicalRecord.pet.id).toBe(5);
		expect(medicalRecord.pet.name).toBe('Luna');
	});

	it('should handle veterinarian relationship', () => {
		const veterinarian = new User();
		veterinarian.id = 10;
		veterinarian.firstName = 'Dra. Martínez';
		veterinarian.lastName = 'López';
    
		medicalRecord.veterinarian = veterinarian;
    
		expect(medicalRecord.veterinarian).toBe(veterinarian);
		expect(medicalRecord.veterinarian.id).toBe(10);
		expect(medicalRecord.veterinarian.firstName).toBe('Dra. Martínez');
	});

	it('should handle diagnostics relationship', () => {
		const diagnostic1 = new Diagnostic();
		diagnostic1.id = 1;

		const diagnostic2 = new Diagnostic();
		diagnostic2.id = 2;

		medicalRecord.diagnostics = [diagnostic1, diagnostic2];

		expect(medicalRecord.diagnostics).toHaveLength(2);
		expect(medicalRecord.diagnostics[0]).toBe(diagnostic1);
		expect(medicalRecord.diagnostics[1]).toBe(diagnostic2);
	});

	it('should handle empty diagnostics array', () => {
		medicalRecord.diagnostics = [];
		expect(medicalRecord.diagnostics).toHaveLength(0);
	});

	it('should handle soft delete', () => {
		const deletionDate = new Date();
		medicalRecord.deletedAt = deletionDate;

		expect(medicalRecord.deletedAt).toBe(deletionDate);
	});

	it('should handle pet size and weight', () => {
		medicalRecord.weight = 12.75;
		medicalRecord.size = PetSize.SMALL;

		expect(medicalRecord.weight).toBe(12.75);
		expect(medicalRecord.size).toBe(PetSize.SMALL);
    
		medicalRecord.size = PetSize.EXTRA_LARGE;
		expect(medicalRecord.size).toBe(PetSize.EXTRA_LARGE);
	});

	it('should handle isDeleted flag', () => {
		medicalRecord.isDeleted = true;
		expect(medicalRecord.isDeleted).toBe(true);
    
		medicalRecord.isDeleted = false;
		expect(medicalRecord.isDeleted).toBe(false);
	});
});