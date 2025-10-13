import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { DiagnosticSeverity } from "../entities/diagnostic.entity";

export class CreateDiagnosticDto {

	@ApiProperty({
		example: 1,
		description: "ID del registro médico (historia clínica)",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		medicalRecordId: number;

	@ApiProperty({
		example: 1,
		description: "ID del veterinario que realiza el diagnóstico",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		veterinarianId: number;

	@ApiProperty({
		example: 1,
		description: "ID del tipo de diagnóstico",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		diagnosticTypeId: number;

	@ApiProperty({
		example: "2024-10-15",
		description: "Fecha de la consulta/visita",
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

	@ApiProperty({
		example: DiagnosticSeverity.MODERATE,
		description: "Severidad del diagnóstico",
		enum: DiagnosticSeverity,
	})
	@IsEnum(DiagnosticSeverity)
		severity: DiagnosticSeverity;

	@ApiPropertyOptional({
		example: "Administrar antibióticos, reposo por 7 días, regresar para seguimiento",
		description: "Recomendaciones y pasos a seguir",
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
}