import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticTypeConflictException, DiagnosticTypeNotFoundException } from '../../common/exceptions';
import { CreateDiagnosticTypeDto } from './dto/create-diagnostic-type.dto';
import { UpdateDiagnosticTypeDto } from './dto/update-diagnostic-type.dto';
import { DiagnosticType } from './entities/diagnostic-type.entity';

@Injectable()
export class DiagnosticTypesService {
	constructor(
		@InjectRepository(DiagnosticType)
		private readonly diagnosticTypeRepository: Repository<DiagnosticType>,
	) {}

	private normalizeText(text: string): string {
		if (!text) return '';
		return text
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim();
	}

	async create(createDiagnosticTypeDto: CreateDiagnosticTypeDto): Promise<DiagnosticType> {
		// Verificar si ya existe un tipo con el mismo nombre (case-insensitive, sin tildes)
		const normalizedName = this.normalizeText(createDiagnosticTypeDto.name);
		const allTypes = await this.diagnosticTypeRepository.find();
		
		const existingType = allTypes.find(
			t => this.normalizeText(t.name) === normalizedName
		);
		
		if (existingType) {
			throw new DiagnosticTypeConflictException(createDiagnosticTypeDto.name);
		}

		const newType = this.diagnosticTypeRepository.create(createDiagnosticTypeDto);
		return await this.diagnosticTypeRepository.save(newType);
	}

	async findAll(): Promise<DiagnosticType[]> {
		return await this.diagnosticTypeRepository.find({
			order: { name: 'ASC' }
		});
	}

	async findOne(id: number): Promise<DiagnosticType> {
		const diagnosticType = await this.diagnosticTypeRepository.findOne({
			where: { id },
			relations: ['diagnostics']
		});

		if (!diagnosticType) {
			throw new DiagnosticTypeNotFoundException(id.toString());
		}

		return diagnosticType;
	}

	async update(id: number, updateDiagnosticTypeDto: UpdateDiagnosticTypeDto): Promise<DiagnosticType> {
		// Verificar si existe otro tipo con el mismo nombre (si se está actualizando)
		if (updateDiagnosticTypeDto.name) {
			const normalizedName = this.normalizeText(updateDiagnosticTypeDto.name);
			const allTypes = await this.diagnosticTypeRepository.find();
			
			const existingType = allTypes.find(
				t => this.normalizeText(t.name) === normalizedName && t.id !== id
			);
			
			if (existingType) {
				throw new DiagnosticTypeConflictException(updateDiagnosticTypeDto.name);
			}
		}

		const result = await this.diagnosticTypeRepository.update(id, updateDiagnosticTypeDto);
		
		if (result.affected === 0) {
			throw new DiagnosticTypeNotFoundException(id.toString());
		}

		return await this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		const diagnosticType = await this.findOne(id);
		
		// Soft delete
		await this.diagnosticTypeRepository.softDelete(id);
	}
}