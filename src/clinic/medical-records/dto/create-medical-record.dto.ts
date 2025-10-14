import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";
import { PetSize } from "../entities/medical-record.entity";

export class CreateMedicalRecordDto {

	@ApiProperty({
		example: 1,
		description: "ID de la mascota",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		petId: number;

	@ApiProperty({
		example: 1,
		description: "ID del veterinario que abre la historia",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		veterinarianId: number;

	@ApiProperty({
		example: "2024-10-15",
		description: "Fecha de apertura de la historia clínica",
	})
	@IsDateString()
		openingDate: Date;

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
		description: "Alergias conocidas de la mascota",
	})
	@IsOptional()
	@IsString()
		allergies?: string;

	@ApiPropertyOptional({
		example: "Antihistamínico diario, suplemento vitamínico",
		description: "Medicamentos habituales de la mascota",
	})
	@IsOptional()
	@IsString()
		medications?: string;

	@ApiPropertyOptional({
		example: "Vacunas al día - Última vacuna antirrábica: 2024-03-15",
		description: "Estado actual de vacunación",
	})
	@IsOptional()
	@IsString()
		vaccinationStatus?: string;
}