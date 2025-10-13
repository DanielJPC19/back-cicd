import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { DiagnosticSeverity, DiagnosticStatus } from "../entities/diagnostic.entity";

export class CreateDiagnosticDto {

	@ApiProperty({
		example: 1,
		description: "ID del tipo de diagnóstico",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		diagnosticTypeId: number;

	@ApiPropertyOptional({
		example: "Infección bacteriana del tracto respiratorio superior",
		description: "Descripción detallada del diagnóstico",
	})
	@IsOptional()
	@IsString()
		description?: string;

	@ApiProperty({
		example: DiagnosticSeverity.MODERATE,
		description: "Severidad del diagnóstico",
		enum: DiagnosticSeverity,
	})
	@IsEnum(DiagnosticSeverity)
		severity: DiagnosticSeverity;

	@ApiPropertyOptional({
		example: DiagnosticStatus.PRELIMINARY,
		description: "Estado del diagnóstico",
		enum: DiagnosticStatus,
	})
	@IsOptional()
	@IsEnum(DiagnosticStatus)
		status?: DiagnosticStatus;

	@ApiPropertyOptional({
		example: "Administrar antibióticos y mantener reposo",
		description: "Recomendaciones para el tratamiento",
	})
	@IsOptional()
	@IsString()
		recommendations?: string;

	@ApiPropertyOptional({
		example: "Regresar en 7 días para evaluación de progreso",
		description: "Instrucciones para seguimiento",
	})
	@IsOptional()
	@IsString()
		followUpInstructions?: string;

	@ApiPropertyOptional({
		example: "2024-10-22",
		description: "Fecha para próxima cita de seguimiento",
	})
	@IsOptional()
	@IsDateString()
		followUpDate?: Date;

	@ApiPropertyOptional({
		example: "Respuesta positiva al tratamiento inicial",
		description: "Notas adicionales del diagnóstico",
	})
	@IsOptional()
	@IsString()
		notes?: string;

	@ApiProperty({
		example: 1,
		description: "ID del registro médico asociado",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		medicalRecordId: number;

	@ApiProperty({
		example: 2,
		description: "ID del veterinario que realiza el diagnóstico",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		veterinarianId: number;
}