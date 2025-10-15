import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeciesConflictException, SpeciesNotFoundException } from '../../common/exceptions';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { Species } from './entities/species.entity';

@Injectable()
export class SpeciesService {
	constructor(
		@InjectRepository(Species)
		private readonly speciesRepository: Repository<Species>,
	) {}

	async create(createSpeciesDto: CreateSpeciesDto): Promise<Species> {
		// Verificar si ya existe una especie con el mismo nombre
		const existingSpecies = await this.speciesRepository.findOne({
			where: { name: createSpeciesDto.name }
		});
		
		if (existingSpecies) {
			throw new SpeciesConflictException(createSpeciesDto.name);
		}

		const newSpecies = this.speciesRepository.create(createSpeciesDto);
		return await this.speciesRepository.save(newSpecies);
	}

	async findAll(): Promise<Species[]> {
		return await this.speciesRepository.find({
			order: { name: 'ASC' }
		});
	}

	async findOne(id: number): Promise<Species> {
		const species = await this.speciesRepository.findOne({
			where: { id },
			relations: ['pets']
		});

		if (!species) {
			throw new SpeciesNotFoundException(id.toString());
		}

		return species;
	}

	async update(id: number, updateSpeciesDto: UpdateSpeciesDto): Promise<Species> {
		// Verificar si existe otra especie con el mismo nombre (si se está actualizando)
		if (updateSpeciesDto.name) {
			const existingSpecies = await this.speciesRepository.findOne({
				where: { name: updateSpeciesDto.name }
			});
			
			if (existingSpecies && existingSpecies.id !== id) {
				throw new SpeciesConflictException(updateSpeciesDto.name);
			}
		}

		const result = await this.speciesRepository.update(id, updateSpeciesDto);
		
		if (result.affected === 0) {
			throw new SpeciesNotFoundException(id.toString());
		}

		return await this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		const species = await this.findOne(id);
		
		// Soft delete
		await this.speciesRepository.softDelete(id);
	}
}