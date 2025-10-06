import { IsInt, Min } from "class-validator"



export class AddRoleDto {


	@Min(1)
	@IsInt()
		userId: number

	@Min(1)
	@IsInt()
		roleId: number	


}