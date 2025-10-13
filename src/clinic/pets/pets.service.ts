import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeciesService } from '../../catalogs/species/species.service';
import { PetNotFoundException } from '../../common/exceptions';
import { UsersService } from '../../core/auth/users/users.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './entities/pet.entity';

@Injectable()
export class PetsService {

	constructor(
		@InjectRepository(Pet)
		private readonly petRepository: Repository<Pet>,
		private readonly usersService: UsersService,
		private readonly speciesService: SpeciesService
	) {}

	async create(createPetDto: CreatePetDto): Promise<Pet> {
		// Verificar que el propietario existe
		const owner = await this.usersService.findOne(createPetDto.ownerId);
		
		// Verificar que la especie existe
		const species = await this.speciesService.findOne(createPetDto.speciesId);

		const newPet = this.petRepository.create({
			name: createPetDto.name,
			gender: createPetDto.gender,
			breed: createPetDto.breed,
			birthDate: createPetDto.birthDate,
			color: createPetDto.color,
			profilePicture: createPetDto.profilePicture,
			owner: owner,
			species: species
		});

		return await this.petRepository.save(newPet);
	}

	async findAll(): Promise<Pet[]> {
		return this.petRepository.find({
			relations: ['owner']
		});
	}

	async findOne(id: number): Promise<Pet> {
		const pet = await this.petRepository.findOne({
			where: { id },
			relations: ['owner', 'medicalRecords']
		});

		if (!pet) {
			throw new PetNotFoundException(id);
		}

		return pet;
	}

	async findByOwner(ownerId: number): Promise<Pet[]> {
		// Verificar que el propietario existe
		await this.usersService.findOne(ownerId);

		return this.petRepository.find({
			where: { owner: { id: ownerId } },
			relations: ['owner']
		});
	}

	async findBySpecies(speciesId: number): Promise<Pet[]> {
		// Verificar que la especie existe
		await this.speciesService.findOne(speciesId);

		return this.petRepository.find({
			where: { species: { id: speciesId } },
			relations: ['owner', 'species']
		});
	}

	async update(id: number, updatePetDto: UpdatePetDto): Promise<Pet> {
		const updateData: any = {
			name: updatePetDto.name,
			gender: updatePetDto.gender,
			breed: updatePetDto.breed,
			birthDate: updatePetDto.birthDate,
			color: updatePetDto.color,
			profilePicture: updatePetDto.profilePicture
		};

		// Si se proporciona speciesId, verificar que la especie existe
		if (updatePetDto.speciesId) {
			const species = await this.speciesService.findOne(updatePetDto.speciesId);
			updateData.species = species;
		}

		// Limpiar valores undefined
		Object.keys(updateData).forEach(key => {
			if (updateData[key] === undefined) {
				delete updateData[key];
			}
		});

		const result = await this.petRepository.update(id, updateData);

		if (!result.affected) {
			throw new PetNotFoundException(id);
		}

		return this.findOne(id);
	}

	async removeById(id: number): Promise<void> {
		const result = await this.petRepository.softDelete({ id });
		
		if (!result.affected) {
			throw new PetNotFoundException(id);
		}

		return;
	}
}