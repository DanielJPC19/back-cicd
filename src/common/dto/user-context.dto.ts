import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UserContextDto {
	@IsInt()
	@Min(1)
		userId: number;

	@IsOptional()
	@IsString()
		email?: string;

	@IsOptional()
	@IsString()
		role?: string;
}
