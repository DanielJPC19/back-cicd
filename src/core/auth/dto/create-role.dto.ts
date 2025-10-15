import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ description: 'Nombre del rol', example: 'admin' })
    @IsNotEmpty()
    @IsString()
    	roleName: string;

    @ApiProperty({ description: 'Descripción del rol', example: 'Administrador con todos los permisos' })
    @IsNotEmpty()
    @IsString()
    	description: string;
}
