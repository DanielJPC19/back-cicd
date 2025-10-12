import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {

  @ApiProperty({ description: 'Nombre del rol', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  	roleName: string;
}
