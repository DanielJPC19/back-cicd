import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";
import { PetGender } from "../entities/pet.entity";
import { CreatePetDto } from "./create-pet.dto";

export class UpdatePetDto extends PartialType(CreatePetDto) {

	@ApiPropertyOptional({
		example: "Max",
		description: "Nombre de la mascota",
	})
	@IsOptional()
	@IsString()
		name?: string;

	@ApiPropertyOptional({
		example: PetGender.MALE,
		description: "Género de la mascota",
		enum: PetGender,
	})
	@IsOptional()
	@IsEnum(PetGender)
		gender?: PetGender;

	@ApiPropertyOptional({
		example: 1,
		description: "ID de la especie de la mascota",
	})
	@IsOptional()
	@IsNumber()
	@IsPositive()
		speciesId?: number;

	@ApiPropertyOptional({
		example: "Golden Retriever",
		description: "Raza de la mascota",
	})
	@IsOptional()
	@IsString()
		breed?: string;

	@ApiPropertyOptional({
		example: "2020-05-15",
		description: "Fecha de nacimiento de la mascota",
	})
	@IsOptional()
	@IsDateString()
		birthDate?: Date;

	@ApiPropertyOptional({
		example: 25.5,
		description: "Peso de la mascota en kilogramos",
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
		example: "Dorado",
		description: "Color de la mascota",
	})
	@IsOptional()
	@IsString()
		color?: string;

	@ApiPropertyOptional({
		example: "https://example.com/pet-photo.jpg",
		description: "URL de la foto de perfil de la mascota",
	})
	@IsOptional()
	@IsString()
		profilePicture?: string;
}