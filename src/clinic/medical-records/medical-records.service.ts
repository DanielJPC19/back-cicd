import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecordConflictException, MedicalRecordNotFoundException } from '../../common/exceptions';
import { UsersService } from '../../core/auth/users/users.service';
import { PetsService } from '../pets/pets.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecord } from './entities/medical-record.entity';

@Injectable()
export class MedicalRecordsService {

	constructor(
		@InjectRepository(MedicalRecord)
		private readonly medicalRecordRepository: Repository<MedicalRecord>,
		private readonly petsService: PetsService,
		private readonly usersService: UsersService
	) {}

	async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
		// Verificar que la mascota existe
		const pet = await this.petsService.findOne(createMedicalRecordDto.petId);
		
		// Verificar que la mascota no tenga ya un registro médico
		const existingRecord = await this.medicalRecordRepository.findOne({
			where: { pet: { id: createMedicalRecordDto.petId } }
		});
		
		if (existingRecord) {
			throw new MedicalRecordConflictException(createMedicalRecordDto.petId);
		}
		
		// Verificar que el veterinario existe
		const veterinarian = await this.usersService.findOne(createMedicalRecordDto.veterinarianId);

		const newMedicalRecord = this.medicalRecordRepository.create({
			...createMedicalRecordDto,
			pet: pet,
			veterinarian: veterinarian
		});

		return await this.medicalRecordRepository.save(newMedicalRecord);
	}

	async findAll(): Promise<MedicalRecord[]> {
		return this.medicalRecordRepository.find({
			relations: ['pet', 'veterinarian', 'diagnostics']
		});
	}

	async findOne(id: number): Promise<MedicalRecord> {
		const medicalRecord = await this.medicalRecordRepository.findOne({
			where: { id },
			relations: ['pet', 'veterinarian', 'diagnostics']
		});

		if (!medicalRecord) {
			throw new MedicalRecordNotFoundException(id);
		}

		return medicalRecord;
	}

	async findByPet(petId: number): Promise<MedicalRecord[]> {
		// Verificar que la mascota existe
		await this.petsService.findOne(petId);

		return this.medicalRecordRepository.find({
			where: { pet: { id: petId } },
			relations: ['pet', 'veterinarian', 'diagnostics'],
			order: { openingDate: 'DESC' }
		});
	}

	async findByVeterinarian(veterinarianId: number): Promise<MedicalRecord[]> {
		// Verificar que el veterinario existe
		await this.usersService.findOne(veterinarianId);

		return this.medicalRecordRepository.find({
			where: { veterinarian: { id: veterinarianId } },
			relations: ['pet', 'veterinarian', 'diagnostics'],
			order: { openingDate: 'DESC' }
		});
	}

	async update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
		// Limpiar valores undefined del DTO
		const updateData = Object.keys(updateMedicalRecordDto).reduce((acc, key) => {
			if (updateMedicalRecordDto[key] !== undefined) {
				acc[key] = updateMedicalRecordDto[key];
			}
			return acc;
		}, {});

		const result = await this.medicalRecordRepository.update(id, updateData);

		if (!result.affected) {
			throw new MedicalRecordNotFoundException(id);
		}

		return this.findOne(id);
	}

	async removeById(id: number): Promise<void> {
		const result = await this.medicalRecordRepository.softDelete({ id });
		
		if (!result.affected) {
			throw new MedicalRecordNotFoundException(id);
		}

		return;
	}
}