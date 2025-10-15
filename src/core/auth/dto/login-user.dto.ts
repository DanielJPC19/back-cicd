import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserLoginDto {
  @ApiProperty({
  	example: 'admin@mail.com',
  	description: 'Correo electrónico registrado del usuario.',
  })
  @IsEmail()
  	email: string;

  @ApiProperty({
  	example: 'password123',
  	description: 'Contraseña del usuario para autenticación.',
  })
  @IsString()
  @IsNotEmpty()
  	password: string;
}
