import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateDiagnosticTypeDto {

	@ApiProperty({
		example: "Otitis externa",
		description: "Nombre del tipo de diagnóstico",
	})
	@IsNotEmpty()
	@IsString()
		name: string;
}