import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticTypesService } from '../../catalogs/diagnostic-types/diagnostic-types.service';
import { DiagnosticNotFoundException } from '../../common/exceptions';
import { UsersService } from '../../core/auth/users/users.service';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { UpdateDiagnosticDto } from './dto/update-diagnostic.dto';
import { Diagnostic } from './entities/diagnostic.entity';

@Injectable()
export class DiagnosticsService {

	constructor(
		@InjectRepository(Diagnostic)
		private readonly diagnosticRepository: Repository<Diagnostic>,
		private readonly medicalRecordsService: MedicalRecordsService,
		private readonly usersService: UsersService,
		private readonly diagnosticTypesService: DiagnosticTypesService
	) {}

	async create(createDiagnosticDto: CreateDiagnosticDto): Promise<Diagnostic> {
		// Verificar que el registro médico existe
		const medicalRecord = await this.medicalRecordsService.findOne(createDiagnosticDto.medicalRecordId);
		
		// Verificar que el veterinario existe
		const veterinarian = await this.usersService.findOne(createDiagnosticDto.veterinarianId);
		
		// Verificar que el tipo de diagnóstico existe
		const diagnosticType = await this.diagnosticTypesService.findOne(createDiagnosticDto.diagnosticTypeId);

		const newDiagnostic = this.diagnosticRepository.create({
			visitDate: createDiagnosticDto.visitDate,
			reason: createDiagnosticDto.reason,
			symptoms: createDiagnosticDto.symptoms,
			examination: createDiagnosticDto.examination,
			severity: createDiagnosticDto.severity,
			recommendations: createDiagnosticDto.recommendations,
			type: diagnosticType,
			medicalRecord: medicalRecord,
			veterinarian: veterinarian
		});

		return await this.diagnosticRepository.save(newDiagnostic);
	}

	async findAll(): Promise<Diagnostic[]> {
		return this.diagnosticRepository.find({
			relations: ['medicalRecord', 'veterinarian']
		});
	}

	async findOne(id: number): Promise<Diagnostic> {
		const diagnostic = await this.diagnosticRepository.findOne({
			where: { id },
			relations: ['medicalRecord', 'veterinarian', 'medicalRecord.pet']
		});

		if (!diagnostic) {
			throw new DiagnosticNotFoundException(id);
		}

		return diagnostic;
	}

	async findByMedicalRecord(medicalRecordId: number): Promise<Diagnostic[]> {
		// Verificar que el registro médico existe
		await this.medicalRecordsService.findOne(medicalRecordId);

		return this.diagnosticRepository.find({
			where: { medicalRecord: { id: medicalRecordId } },
			relations: ['medicalRecord', 'veterinarian'],
			order: { createdAt: 'DESC' }
		});
	}

	async findByVeterinarian(veterinarianId: number): Promise<Diagnostic[]> {
		// Verificar que el veterinario existe
		await this.usersService.findOne(veterinarianId);

		return this.diagnosticRepository.find({
			where: { veterinarian: { id: veterinarianId } },
			relations: ['medicalRecord', 'veterinarian', 'medicalRecord.pet'],
			order: { createdAt: 'DESC' }
		});
	}

	async findBySeverity(severity: string): Promise<Diagnostic[]> {
		return this.diagnosticRepository.find({
			where: { severity: severity as any },
			relations: ['medicalRecord', 'veterinarian', 'medicalRecord.pet'],
			order: { createdAt: 'DESC' }
		});
	}

	async findByPet(petId: number): Promise<Diagnostic[]> {
		return this.diagnosticRepository.find({
			where: { medicalRecord: { pet: { id: petId } } },
			relations: ['medicalRecord', 'veterinarian', 'medicalRecord.pet'],
			order: { createdAt: 'DESC' }
		});
	}

	async update(id: number, updateDiagnosticDto: UpdateDiagnosticDto): Promise<Diagnostic> {
		// Si se proporciona diagnosticTypeId, verificar que el tipo existe
		if (updateDiagnosticDto.diagnosticTypeId) {
			await this.diagnosticTypesService.findOne(updateDiagnosticDto.diagnosticTypeId);
		}

		// Limpiar valores undefined del DTO
		const updateData = Object.keys(updateDiagnosticDto).reduce((acc, key) => {
			if (updateDiagnosticDto[key] !== undefined) {
				acc[key] = updateDiagnosticDto[key];
			}
			return acc;
		}, {});

		const result = await this.diagnosticRepository.update(id, updateData);

		if (!result.affected) {
			throw new DiagnosticNotFoundException(id);
		}

		return this.findOne(id);
	}

	async removeById(id: number): Promise<void> {
		const result = await this.diagnosticRepository.softDelete({ id });
		
		if (!result.affected) {
			throw new DiagnosticNotFoundException(id);
		}

		return;
	}
}