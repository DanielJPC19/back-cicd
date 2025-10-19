import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CalendarQueryDto {
	@IsOptional()
	@IsDateString()
		timeMin?: string;

	@IsOptional()
	@IsDateString()
		timeMax?: string;
}

export class OAuthCallbackDto {
	@IsString()
		code: string;
}
