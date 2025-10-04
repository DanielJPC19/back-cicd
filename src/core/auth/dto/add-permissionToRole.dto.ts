import { IsInt, Min } from "class-validator"



export class AddPermissionDto {



	@Min(1)
	@IsInt()
		roleId: number

	@Min(1)
	@IsInt()
		permissionId: number


}