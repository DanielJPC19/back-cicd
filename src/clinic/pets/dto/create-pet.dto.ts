import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { PetGender } from "../entities/pet.entity";

export class CreatePetDto {

	@ApiProperty({
		example: "Max",
		description: "Nombre de la mascota",
	})
	@IsNotEmpty()
	@IsString()
		name: string;

	@ApiProperty({
		example: PetGender.MALE,
		description: "Género de la mascota",
		enum: PetGender,
	})
	@IsEnum(PetGender)
		gender: PetGender;

	@ApiProperty({
		example: "Perro",
		description: "Especie de la mascota",
	})
	@IsNotEmpty()
	@IsString()
		species: string;

	@ApiProperty({
		example: 1,
		description: "ID de la especie de la mascota",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		speciesId: number;

	@ApiProperty({
		example: "Golden Retriever",
		description: "Raza de la mascota",
	})
	@IsNotEmpty()
	@IsString()
		breed: string;

	@ApiProperty({
		example: "2020-05-15",
		description: "Fecha de nacimiento de la mascota",
	})
	@IsDateString()
		birthDate: Date;

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

	@ApiProperty({
		example: 1,
		description: "ID del propietario de la mascota",
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
		ownerId: number;
}