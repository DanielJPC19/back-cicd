// src/users/dto/SetUserRole.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * DTO para la petición de cambio de rol de un usuario.
 */
export class SetUserRoleDto {
  @ApiProperty({
  	description: 'El ID del nuevo rol que se asignará al usuario.',
  	example: 4, // El ID de un rol, por ejemplo, 'Administrador'
  	type: Number,
  })
  @IsNotEmpty({ message: 'El role_id es obligatorio.' })
  @IsInt({ message: 'El role_id debe ser un número entero.' })
  	roleId: number;
}