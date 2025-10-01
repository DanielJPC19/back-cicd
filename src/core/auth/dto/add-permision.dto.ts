import { IsArray, IsInt, IsString, Min } from "class-validator";

export class AddPermissionsDto {

	@IsArray()
	@IsInt({each: true})
	@Min(1, {each: true})
		permissionsIds?: number[];
	
	@IsArray()
	@IsString({each: true})
		permmissionsName?: string[]

}
