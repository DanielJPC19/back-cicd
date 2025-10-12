// src/users/dto/SetUserRole.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';


export class SetUserRoleDto {
  @ApiProperty({
  	description: 'El ID del nuevo rol que se asignará al usuario.',
  	example: 1, 
  	type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  	roleId: number;
}