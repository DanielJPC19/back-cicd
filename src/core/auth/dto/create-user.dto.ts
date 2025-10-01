import { IsString } from "class-validator";

export class CreateUserDto {

	@IsString()
		email: string

	@IsString()
		firsName: string

	@IsString()
		lastName: string

	@IsString()
		password: string

	@IsString()
		phoneNumber: string

	@IsString()
		address: string

	@IsString()
		profilePicture?: string


	
}