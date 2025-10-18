import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ScheduleStatus } from '../entities/schedule.entity';

export class CreateScheduleDto {
	@IsString()
		name: string;

	@IsOptional()
	@IsString()
		description?: string;

	@IsString()
		startTime: string;

	@IsString()
		endTime: string;

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	@Min(0, { each: true })
	@Max(6, { each: true })
		daysOfWeek?: number[];

	@IsOptional()
	@IsDateString()
		startDate?: string;

	@IsOptional()
	@IsDateString()
		endDate?: string;

	@IsOptional()
	@IsInt()
	@Min(15)
	@Max(480)
		appointmentDuration?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(60)
		breakDuration?: number;

	@IsOptional()
	@IsEnum(ScheduleStatus)
		status?: ScheduleStatus;
}

export class UpdateScheduleDto {
	@IsOptional()
	@IsString()
		name?: string;

	@IsOptional()
	@IsString()
		description?: string;

	@IsOptional()
	@IsString()
		startTime?: string;

	@IsOptional()
	@IsString()
		endTime?: string;

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	@Min(0, { each: true })
	@Max(6, { each: true })
		daysOfWeek?: number[];

	@IsOptional()
	@IsDateString()
		startDate?: string;

	@IsOptional()
	@IsDateString()
		endDate?: string;

	@IsOptional()
	@IsInt()
	@Min(15)
	@Max(480)
		appointmentDuration?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(60)
		breakDuration?: number;

	@IsOptional()
	@IsEnum(ScheduleStatus)
		status?: ScheduleStatus;
}
