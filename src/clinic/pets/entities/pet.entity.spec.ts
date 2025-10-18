import { Species } from '../../../catalogs/species/entities/species.entity';
import { User } from '../../../core/auth/entities/user.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
import { Pet, PetGender } from './pet.entity';

describe('Pet Entity', () => {
	let pet: Pet;

	beforeEach(() => {
		pet = new Pet();
	});

	it('should be defined', () => {
		expect(pet).toBeDefined();
	});

	it('should create a pet with all properties', () => {
		const species = new Species();
		species.id = 1;
		species.name = 'Perro';

		const owner = new User();
		owner.id = 1;
		owner.firstName = 'Juan';

		pet.id = 1;
		pet.name = 'Buddy';
		pet.gender = PetGender.MALE;
		pet.species = species;
		pet.breed = 'Golden Retriever';
		pet.birthDate = new Date('2020-01-01');
		pet.color = 'Dorado';
		pet.isDeleted = false;
		pet.profilePicture = 'https://example.com/buddy.jpg';
		pet.createdAt = new Date();
		pet.updatedAt = new Date();
		pet.owner = owner;

		expect(pet.id).toBe(1);
		expect(pet.name).toBe('Buddy');
		expect(pet.gender).toBe(PetGender.MALE);
		expect(pet.species).toBe(species);
		expect(pet.breed).toBe('Golden Retriever');
		expect(pet.birthDate).toBeInstanceOf(Date);
		expect(pet.color).toBe('Dorado');
		expect(pet.isDeleted).toBe(false);
		expect(pet.profilePicture).toBe('https://example.com/buddy.jpg');
		expect(pet.createdAt).toBeInstanceOf(Date);
		expect(pet.updatedAt).toBeInstanceOf(Date);
		expect(pet.owner).toBe(owner);
	});

	it('should handle gender types', () => {
		pet.gender = PetGender.FEMALE;
		expect(pet.gender).toBe(PetGender.FEMALE);
    
		pet.gender = PetGender.MALE;
		expect(pet.gender).toBe(PetGender.MALE);
	});

	it('should handle species relationship', () => {
		const species = new Species();
		species.id = 2;
		species.name = 'Gato';
    
		pet.species = species;
    
		expect(pet.species).toBe(species);
		expect(pet.species.id).toBe(2);
		expect(pet.species.name).toBe('Gato');
	});

	it('should handle owner relationship', () => {
		const owner = new User();
		owner.id = 5;
		owner.firstName = 'María';
		owner.lastName = 'García';
    
		pet.owner = owner;
    
		expect(pet.owner).toBe(owner);
		expect(pet.owner.id).toBe(5);
		expect(pet.owner.firstName).toBe('María');
	});

	it('should handle medical records relationship', () => {
		const medicalRecord1 = new MedicalRecord();
		medicalRecord1.id = 1;

		const medicalRecord2 = new MedicalRecord();
		medicalRecord2.id = 2;

		pet.medicalRecords = [medicalRecord1, medicalRecord2];

		expect(pet.medicalRecords).toHaveLength(2);
		expect(pet.medicalRecords[0]).toBe(medicalRecord1);
		expect(pet.medicalRecords[1]).toBe(medicalRecord2);
	});

	it('should handle empty medical records array', () => {
		pet.medicalRecords = [];
		expect(pet.medicalRecords).toHaveLength(0);
	});

	it('should handle soft delete', () => {
		const deletionDate = new Date();
		pet.deletedAt = deletionDate;

		expect(pet.deletedAt).toBe(deletionDate);
	});

	it('should handle optional profile picture', () => {
		pet.profilePicture = 'https://example.com/new-photo.jpg';
		expect(pet.profilePicture).toBe('https://example.com/new-photo.jpg');
	});

	it('should handle isDeleted flag', () => {
		pet.isDeleted = true;
		expect(pet.isDeleted).toBe(true);
    
		pet.isDeleted = false;
		expect(pet.isDeleted).toBe(false);
	});

	it('should handle color property', () => {
		pet.color = 'Negro';
		expect(pet.color).toBe('Negro');
    
		pet.color = 'Blanco';
		expect(pet.color).toBe('Blanco');
	});
});