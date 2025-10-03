import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
	
	@IsEmail()	
		email: string

	@IsNotEmpty()
	@IsString()
		firsName: string

	@IsNotEmpty()
	@IsString()
		lastName: string

	@IsNotEmpty()
	@IsString()
		password: string

	@IsNotEmpty()
	@IsString()
		phoneNumber: string

	@IsNotEmpty()
	@IsString()
		address: string

	@IsOptional()
	@IsNotEmpty()
	@IsString()
		profilePicture?: string


	
}