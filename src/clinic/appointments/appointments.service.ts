import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GoogleCalendarService } from '../../core/integrations/google-calendar/google-calendar.service';
import { AppointmentCalendarEvent } from '../../core/integrations/google-calendar/interfaces/google-calendar.interface';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class AppointmentsService {
	constructor(
		@InjectRepository(Schedule)
		private scheduleRepository: Repository<Schedule>,
		@InjectRepository(Appointment)
		private appointmentRepository: Repository<Appointment>,
		private googleCalendarService: GoogleCalendarService,
	) {}

	// Schedule methods
	async createSchedule(createScheduleDto: CreateScheduleDto, userId: number): Promise<Schedule> {
		const schedule = this.scheduleRepository.create({
			...createScheduleDto,
			user: { id: userId },
		});

		return await this.scheduleRepository.save(schedule);
	}

	async findAllSchedules(userId: number, paginationDto: PaginationDto): Promise<{ schedules: Schedule[]; total: number }> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [schedules, total] = await this.scheduleRepository.findAndCount({
			where: { user: { id: userId }, isDeleted: false },
			skip,
			take: limit,
			order: { createdAt: 'DESC' },
		});

		return { schedules, total };
	}

	async findOneSchedule(id: number, userId: number): Promise<Schedule> {
		const schedule = await this.scheduleRepository.findOne({
			where: { id, user: { id: userId }, isDeleted: false },
			relations: ['appointments'],
		});

		if (!schedule) {
			throw new NotFoundException(`Schedule with ID ${id} not found`);
		}

		return schedule;
	}

	async updateSchedule(id: number, updateScheduleDto: UpdateScheduleDto, userId: number): Promise<Schedule> {
		const schedule = await this.findOneSchedule(id, userId);
		
		Object.assign(schedule, updateScheduleDto);
		return await this.scheduleRepository.save(schedule);
	}

	async removeSchedule(id: number, userId: number): Promise<void> {
		const schedule = await this.findOneSchedule(id, userId);
		schedule.isDeleted = true;
		await this.scheduleRepository.save(schedule);
	}

	// Appointment methods
	async createAppointment(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
		// Check for time conflicts
		await this.checkTimeConflicts(
			createAppointmentDto.appointmentDate,
			createAppointmentDto.startTime,
			createAppointmentDto.endTime,
			createAppointmentDto.veterinarianId,
		);

		const appointment = this.appointmentRepository.create(createAppointmentDto);
		const savedAppointment = await this.appointmentRepository.save(appointment);

		// Sync with Google Calendar if service is initialized
		if (this.googleCalendarService.isInitialized()) {
			try {
				await this.syncAppointmentWithGoogleCalendar(savedAppointment);
			} catch (error) {
				// Log error but don't fail the appointment creation
				console.error('Failed to sync appointment with Google Calendar:', error);
			}
		}

		return savedAppointment;
	}

	async findAllAppointments(paginationDto: PaginationDto): Promise<{ appointments: Appointment[]; total: number }> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [appointments, total] = await this.appointmentRepository.findAndCount({
			where: { isDeleted: false },
			skip,
			take: limit,
			order: { appointmentDate: 'ASC', startTime: 'ASC' },
		});

		return { appointments, total };
	}

	async findAppointmentsByVeterinarian(veterinarianId: number, paginationDto: PaginationDto): Promise<{ appointments: Appointment[]; total: number }> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [appointments, total] = await this.appointmentRepository.findAndCount({
			where: { veterinarian: { id: veterinarianId }, isDeleted: false },
			skip,
			take: limit,
			order: { appointmentDate: 'ASC', startTime: 'ASC' },
		});

		return { appointments, total };
	}

	async findAppointmentsByPet(petId: number, paginationDto: PaginationDto): Promise<{ appointments: Appointment[]; total: number }> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [appointments, total] = await this.appointmentRepository.findAndCount({
			where: { pet: { id: petId }, isDeleted: false },
			skip,
			take: limit,
			order: { appointmentDate: 'ASC', startTime: 'ASC' },
		});

		return { appointments, total };
	}

	async findOneAppointment(id: number): Promise<Appointment> {
		const appointment = await this.appointmentRepository.findOne({
			where: { id, isDeleted: false },
			relations: ['veterinarian', 'pet', 'diagnostic', 'schedule'],
		});

		if (!appointment) {
			throw new NotFoundException(`Appointment with ID ${id} not found`);
		}

		return appointment;
	}

	async updateAppointment(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
		const appointment = await this.findOneAppointment(id);

		// Check for time conflicts if time is being updated
		if (updateAppointmentDto.startTime || updateAppointmentDto.endTime || updateAppointmentDto.appointmentDate) {
			const appointmentDate = updateAppointmentDto.appointmentDate || appointment.appointmentDate;
			const startTime = updateAppointmentDto.startTime || appointment.startTime;
			const endTime = updateAppointmentDto.endTime || appointment.endTime;
			const veterinarianId = updateAppointmentDto.veterinarianId || appointment.veterinarian.id;

			await this.checkTimeConflicts(appointmentDate, startTime, endTime, veterinarianId, id);
		}

		Object.assign(appointment, updateAppointmentDto);
		const updatedAppointment = await this.appointmentRepository.save(appointment);

		// Sync with Google Calendar if service is initialized
		if (this.googleCalendarService.isInitialized()) {
			try {
				await this.syncAppointmentWithGoogleCalendar(updatedAppointment);
			} catch (error) {
				// Log error but don't fail the appointment update
				console.error('Failed to sync appointment with Google Calendar:', error);
			}
		}

		return updatedAppointment;
	}

	async removeAppointment(id: number): Promise<void> {
		const appointment = await this.findOneAppointment(id);
		appointment.isDeleted = true;
		await this.appointmentRepository.save(appointment);

		// Remove from Google Calendar if service is initialized and event exists
		if (this.googleCalendarService.isInitialized() && appointment.googleCalendarEventId) {
			try {
				await this.googleCalendarService.deleteEvent(appointment.googleCalendarEventId);
			} catch (error) {
				// Log error but don't fail the appointment deletion
				console.error('Failed to delete appointment from Google Calendar:', error);
			}
		}
	}

	private async checkTimeConflicts(
		appointmentDate: string | Date,
		startTime: string,
		endTime: string,
		veterinarianId: number,
		excludeAppointmentId?: number,
	): Promise<void> {
		const date = new Date(appointmentDate);
		const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
		const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${endTime}`);

		if (startDateTime >= endDateTime) {
			throw new BadRequestException('Start time must be before end time');
		}

		const queryBuilder = this.appointmentRepository
			.createQueryBuilder('appointment')
			.where('appointment.veterinarian_id = :veterinarianId', { veterinarianId })
			.andWhere('appointment.is_deleted = false')
			.andWhere('DATE(appointment.appointment_date) = DATE(:appointmentDate)', { appointmentDate })
			.andWhere(
				'(appointment.start_time < :endTime AND appointment.end_time > :startTime)',
				{ startTime, endTime }
			);

		if (excludeAppointmentId) {
			queryBuilder.andWhere('appointment.id != :excludeAppointmentId', { excludeAppointmentId });
		}

		const conflictingAppointment = await queryBuilder.getOne();

		if (conflictingAppointment) {
			throw new ConflictException('There is already an appointment scheduled for this time slot');
		}
	}

	/**
	 * Sincroniza un appointment con Google Calendar
	 */
	private async syncAppointmentWithGoogleCalendar(appointment: Appointment): Promise<void> {
		const appointmentEvent: AppointmentCalendarEvent = {
			appointmentId: appointment.id,
			title: `${appointment.type} - ${appointment.pet.name}`,
			description: appointment.notes || appointment.reason,
			startDateTime: new Date(`${appointment.appointmentDate.toISOString().split('T')[0]}T${appointment.startTime}`),
			endDateTime: new Date(`${appointment.appointmentDate.toISOString().split('T')[0]}T${appointment.endTime}`),
			veterinarianEmail: appointment.veterinarian.email,
			petOwnerEmail: appointment.pet.owner.email,
			location: 'Veterinary Clinic', // Puedes hacer esto configurable
		};

		const googleEvent = await this.googleCalendarService.syncAppointmentWithCalendar(
			appointmentEvent,
			appointment.googleCalendarEventId,
		);

		// Actualizar el appointment con el ID del evento de Google Calendar
		if (googleEvent.id && !appointment.googleCalendarEventId) {
			appointment.googleCalendarEventId = googleEvent.id;
			await this.appointmentRepository.save(appointment);
		}
	}
}
