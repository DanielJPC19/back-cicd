import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {

	@ApiProperty({
		example: "juan.perez@example.com",
		description: "Correo electrónico del usuario",
	})
	@IsEmail()
		email: string;

	@ApiProperty({
		example: "Juan",
		description: "Primer nombre del usuario",
	})
	@IsNotEmpty()
	@IsString()
		firstName: string;

	@ApiProperty({
		example: "Pérez",
		description: "Apellido del usuario",
	})
	@IsNotEmpty()
	@IsString()
		lastName: string;

	@ApiProperty({
		example: "Secreta123",
		description: "Contraseña del usuario",
	})
	@IsNotEmpty()
	@IsString()
		password: string;

	@ApiProperty({
		example: "3001234567",
		description: "Número de teléfono del usuario",
	})
	@IsNotEmpty()
	@IsString()
		phoneNumber: string;

	@ApiProperty({
		example: "Calle Falsa 123, Bogotá",
		description: "Dirección del usuario",
	})
	@IsNotEmpty()
	@IsString()
		address: string;

	@ApiPropertyOptional({
		example: "https://example.com/profile.jpg",
		description: "URL de la foto de perfil del usuario",
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
		profilePicture?: string;
}
