import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddPermissionDto {
  @ApiProperty({
  	description: 'ID del rol al que se le asignará el permiso',
  	example: 1,
  	minimum: 1,
  })
  @Min(1)
  @IsInt()
  	roleId: number;

  @ApiProperty({
  	description: 'ID del permiso que se va a asignar al rol',
  	example: 5,
  	minimum: 1,
  })
  @Min(1)
  @IsInt()
  	permissionId: number;
}
