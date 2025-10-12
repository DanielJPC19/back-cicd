import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";
import { MedicalRecordStatus, MedicalRecordType, PetSize } from "../entities/medical-record.entity";

export class CreateMedicalRecordDto {

	@ApiProperty({
		example: MedicalRecordType.CONSULTATION,
		description: "Tipo de registro médico",
		enum: MedicalRecordType,
	})
	@IsEnum(MedicalRecordType)
		type: MedicalRecordType;

	@ApiPropertyOptional({
		example: MedicalRecordStatus.SCHEDULED,
		description: "Estado del registro médico",
		enum: MedicalRecordStatus,
	})
	@IsOptional()
	@IsEnum(MedicalRecordStatus)
		status?: MedicalRecordStatus;

	@ApiProperty({
		example: "2024-10-15",
		description: "Fecha de la visita",
	})
	@IsDateString()
		visitDate: Date;

	@ApiProperty({
		example: "Revisión de rutina",
		description: "Motivo de la consulta",
	})
	@IsNotEmpty()
	@IsString()
		reason: string;

	@ApiPropertyOptional({
		example: "Letargo, pérdida de apetito",
		description: "Síntomas observados",
	})
	@IsOptional()
	@IsString()
		symptoms?: string;

	@ApiPropertyOptional({
		example: "Examen físico normal, temperatura 38.5°C",
		description: "Resultados del examen físico",
	})
	@IsOptional()
	@IsString()
		examination?: string;

	@ApiPropertyOptional({
		example: "Reposo y medicación antibiótica",
		description: "Tratamiento aplicado",
	})
	@IsOptional()
	@IsString()
		treatment?: string;

	@ApiPropertyOptional({
		example: "Amoxicilina 250mg cada 12 horas por 7 días",
		description: "Prescripción médica",
	})
	@IsOptional()
	@IsString()
		prescription?: string;

	@ApiPropertyOptional({
		example: "Paciente cooperativo durante el examen",
		description: "Notas adicionales",
	})
	@IsOptional()
	@IsString()
		notes?: string;

	@ApiPropertyOptional({
		example: 25.5,
		description: "Peso actual de la mascota en kilogramos",
		minimum: 0.1,
		maximum: 999.99,
	})
	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsPositive()
	@Min(0.1)
	@Max(999.99)
		weight?: number;

	@ApiPropertyOptional({
		example: PetSize.MEDIUM,
		description: "Tamaño actual de la mascota",
		enum: PetSize,
	})
	@IsOptional()
	@IsEnum(PetSize)
		size?: PetSize;

	@ApiPropertyOptional({
		example: "Alérgico al pollo y mariscos",
		description: "Alergias conocidas al momento de la consulta",
	})
	@IsOptional()
	@IsString()
		allergies?: string;

	@ApiPropertyOptional({
		example: "Antihistamínico diario, suplemento vitamínico",
		description: "Medicamentos actuales al momento de la consulta",
	})
	@IsOptional()
	@IsString()
		medications?: string;

	@ApiPropertyOptional({
		example: "Paciente muy activo, necesita ejercicio diario",
		description: "Notas especiales sobre el comportamiento y cuidados",
	})
	@IsOptional()
	@IsString()
		specialNotes?: string;

	@ApiPropertyOptional({
		example: "Vacunas al día - Última vacuna antirrábica: 2024-03-15",
		description: "Estado actual de vacunación",
	})
	@IsOptional()
	@IsString()
		vaccinationStatus?: string;

	@ApiPropertyOptional({
		example: 75000,
		description: "Costo de la consulta en pesos",
		minimum: 0,
		maximum: 99999999.99,
	})
	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	@Max(99999999.99)
		cost?: number;

	@ApiProperty({
		example: 1,
		description: "ID de la mascota",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		petId: number;

	@ApiProperty({
		example: 2,
		description: "ID del veterinario",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		veterinarianId: number;
}