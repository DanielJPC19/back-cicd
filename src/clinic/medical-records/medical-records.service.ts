import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecordNotFoundException } from '../../common/exceptions';
import { UsersService } from '../../core/auth/users/users.service';
import { DiagnosticTypesService } from '../diagnostic-types/diagnostic-types.service';
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
		private readonly usersService: UsersService,
		private readonly diagnosticTypesService: DiagnosticTypesService
	) {}

	async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
		// Verificar que la mascota existe
		const pet = await this.petsService.findOne(createMedicalRecordDto.petId);
		
		// Verificar que el veterinario existe
		const veterinarian = await this.usersService.findOne(createMedicalRecordDto.veterinarianId);
		
		// Verificar que el tipo de diagnóstico existe
		const diagnosticType = await this.diagnosticTypesService.findOne(createMedicalRecordDto.diagnosticTypeId);

		const newMedicalRecord = this.medicalRecordRepository.create({
			...createMedicalRecordDto,
			pet: pet,
			veterinarian: veterinarian,
			type: diagnosticType
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
			order: { visitDate: 'DESC' }
		});
	}

	async findByVeterinarian(veterinarianId: number): Promise<MedicalRecord[]> {
		// Verificar que el veterinario existe
		await this.usersService.findOne(veterinarianId);

		return this.medicalRecordRepository.find({
			where: { veterinarian: { id: veterinarianId } },
			relations: ['pet', 'veterinarian', 'diagnostics'],
			order: { visitDate: 'DESC' }
		});
	}

	async update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
		const updateData: any = {
			status: updateMedicalRecordDto.status,
			visitDate: updateMedicalRecordDto.visitDate,
			reason: updateMedicalRecordDto.reason,
			symptoms: updateMedicalRecordDto.symptoms,
			examination: updateMedicalRecordDto.examination,
			prescription: updateMedicalRecordDto.prescription,
			notes: updateMedicalRecordDto.notes,
			weight: updateMedicalRecordDto.weight,
			size: updateMedicalRecordDto.size,
			allergies: updateMedicalRecordDto.allergies,
			medications: updateMedicalRecordDto.medications,
			specialNotes: updateMedicalRecordDto.specialNotes,
			vaccinationStatus: updateMedicalRecordDto.vaccinationStatus,
			cost: updateMedicalRecordDto.cost
		};

		// Si se proporciona diagnosticTypeId, verificar que el tipo existe
		if (updateMedicalRecordDto.diagnosticTypeId) {
			const diagnosticType = await this.diagnosticTypesService.findOne(updateMedicalRecordDto.diagnosticTypeId);
			updateData.type = diagnosticType;
		}

		// Limpiar valores undefined
		Object.keys(updateData).forEach(key => {
			if (updateData[key] === undefined) {
				delete updateData[key];
			}
		});

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