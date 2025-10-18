import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
	@IsDateString()
		appointmentDate: string;

	@IsString()
		startTime: string;

	@IsString()
		endTime: string;

	@IsOptional()
	@IsEnum(AppointmentStatus)
		status?: AppointmentStatus;

	@IsEnum(AppointmentType)
		type: AppointmentType;

	@IsOptional()
	@IsString()
		notes?: string;

	@IsOptional()
	@IsString()
		reason?: string;

	@IsInt()
	@Min(1)
		veterinarianId: number;

	@IsInt()
	@Min(1)
		petId: number;

	@IsOptional()
	@IsInt()
	@Min(1)
		diagnosticId?: number;

	@IsInt()
	@Min(1)
		scheduleId: number;
}

export class UpdateAppointmentDto {
	@IsOptional()
	@IsDateString()
		appointmentDate?: string;

	@IsOptional()
	@IsString()
		startTime?: string;

	@IsOptional()
	@IsString()
		endTime?: string;

	@IsOptional()
	@IsEnum(AppointmentStatus)
		status?: AppointmentStatus;

	@IsOptional()
	@IsEnum(AppointmentType)
		type?: AppointmentType;

	@IsOptional()
	@IsString()
		notes?: string;

	@IsOptional()
	@IsString()
		reason?: string;

	@IsOptional()
	@IsInt()
	@Min(1)
		veterinarianId?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
		petId?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
		diagnosticId?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
		scheduleId?: number;
}
