import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { DiagnosticSeverity, DiagnosticStatus } from "../entities/diagnostic.entity";
import { CreateDiagnosticDto } from "./create-diagnostic.dto";

export class UpdateDiagnosticDto extends PartialType(CreateDiagnosticDto) {

	@ApiPropertyOptional({
		example: "Infección bacteriana del tracto respiratorio superior",
		description: "Descripción detallada del diagnóstico",
	})
	@IsOptional()
	@IsString()
		description?: string;

	@ApiPropertyOptional({
		example: DiagnosticSeverity.MODERATE,
		description: "Severidad del diagnóstico",
		enum: DiagnosticSeverity,
	})
	@IsOptional()
	@IsEnum(DiagnosticSeverity)
		severity?: DiagnosticSeverity;

	@ApiPropertyOptional({
		example: DiagnosticStatus.CONFIRMED,
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
}