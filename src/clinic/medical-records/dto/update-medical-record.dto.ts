import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";
import { MedicalRecordStatus } from "../entities/medical-record.entity";
import { CreateMedicalRecordDto } from "./create-medical-record.dto";

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {

	@ApiPropertyOptional({
		example: 1,
		description: "ID del tipo de diagnóstico",
	})
	@IsOptional()
	@IsNumber()
	@IsPositive()
		diagnosticTypeId?: number;

	@ApiPropertyOptional({
		example: MedicalRecordStatus.COMPLETED,
		description: "Estado del registro médico",
		enum: MedicalRecordStatus,
	})
	@IsOptional()
	@IsEnum(MedicalRecordStatus)
		status?: MedicalRecordStatus;

	@ApiPropertyOptional({
		example: "2024-10-15",
		description: "Fecha de la visita",
	})
	@IsOptional()
	@IsDateString()
		visitDate?: Date;

	@ApiPropertyOptional({
		example: "Revisión de rutina",
		description: "Motivo de la consulta",
	})
	@IsOptional()
	@IsString()
		reason?: string;

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
}