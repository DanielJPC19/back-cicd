import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePermissionDto {
  @ApiProperty({
  	example: 'user_create',
  	description: 'Nombre único del permiso que se desea crear.',
  })
  @IsNotEmpty()
  @IsString()
  	permissionName: string;
}
