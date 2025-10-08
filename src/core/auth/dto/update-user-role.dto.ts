import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class UpdateRoleDto {
    @ApiProperty({ description: "ID del usuario", example: 1 })
    @Min(1)
    @IsInt()
    	userId: number;

    @ApiProperty({ description: "ID del rol", example: 2 })
    @Min(1)
    @IsInt()
    	roleId: number;    
}
