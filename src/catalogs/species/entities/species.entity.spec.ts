import { Pet, PetGender } from '../../../clinic/pets/entities/pet.entity';
import { Species } from './species.entity';

describe('Species Entity', () => {
  let species: Species;

  beforeEach(() => {
    species = new Species();
  });

  it('should be defined', () => {
    expect(species).toBeDefined();
  });

  it('should create a species with all properties', () => {
    species.id = 1;
    species.name = 'Perro';
    species.description = 'Mamífero doméstico';
    species.isDeleted = false;
    species.createdAt = new Date();
    species.updatedAt = new Date();
    expect(species.id).toBe(1);
    expect(species.name).toBe('Perro');
    expect(species.description).toBe('Mamífero doméstico');
    expect(species.isDeleted).toBe(false);
    expect(species.createdAt).toBeInstanceOf(Date);
    expect(species.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle pets relationship', () => {
    const pet1 = new Pet();
    pet1.id = 1;
    pet1.name = 'Buddy';
    pet1.gender = PetGender.MALE;

    const pet2 = new Pet();
    pet2.id = 2;
    pet2.name = 'Luna';
    pet2.gender = PetGender.FEMALE;

    species.pets = [pet1, pet2];

    expect(species.pets).toHaveLength(2);
    expect(species.pets[0]).toBe(pet1);
    expect(species.pets[1]).toBe(pet2);
  });

  it('should handle empty pets array', () => {
    species.pets = [];
    expect(species.pets).toHaveLength(0);
  });

  it('should handle soft delete with isDeleted flag', () => {
    species.isDeleted = true;
    const deletionDate = new Date();
    species.deletedAt = deletionDate;

    expect(species.isDeleted).toBe(true);
    expect(species.deletedAt).toBe(deletionDate);
  });

  it('should handle default isDeleted value', () => {
    // Testing the default value behavior
    expect(species.isDeleted).toBeUndefined(); // Initially undefined until set
    species.isDeleted = false; // Default value as per entity definition
    expect(species.isDeleted).toBe(false);
  });
});