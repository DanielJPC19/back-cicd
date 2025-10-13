import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";
import { DiagnosticSeverity, DiagnosticStatus } from "../entities/diagnostic.entity";

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
}