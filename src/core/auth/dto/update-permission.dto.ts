import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @ApiProperty({
  	example: 'user_update',
  	description: 'Nombre actualizado del permiso.',
  })
  @IsString()
  @IsNotEmpty()
  	permissionName: string;
}
