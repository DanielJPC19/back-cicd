import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
    	description: 'Correo electrónico del usuario',
    	example: 'juan.perez@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    	email: string;
}
