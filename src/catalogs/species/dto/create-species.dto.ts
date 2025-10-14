import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSpeciesDto {

	@ApiProperty({
		example: "Perro",
		description: "Nombre de la especie",
	})
	@IsNotEmpty()
	@IsString()
		name: string;

	@ApiPropertyOptional({
		example: "Mamífero doméstico de la familia Canidae",
		description: "Descripción de la especie",
	})
	@IsOptional()
	@IsString()
		description?: string;
}