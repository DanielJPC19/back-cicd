import { IsInt, IsOptional, Min } from 'class-validator';

export class UserContextDto {
	@IsInt()
	@Min(1)
		userId: number;

	@IsOptional()
		email?: string;

	@IsOptional()
		role?: string;
}
