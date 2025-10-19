import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GoogleCalendarService } from '../../core/integrations/google-calendar/google-calendar.service';
import { GoogleAuthProvider } from '../../core/integrations/google-calendar/provider/google-auth.provider';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';
import { Schedule, ScheduleStatus } from './entities/schedule.entity';

describe('AppointmentsService', () => {
	let service: AppointmentsService;
	let scheduleRepository: Repository<Schedule>;
	let appointmentRepository: Repository<Appointment>;
	let googleCalendarService: GoogleCalendarService;

	const mockSchedule: Schedule = {
		id: 1,
		name: 'Test Schedule',
		description: 'Test Description',
		startTime: '09:00',
		endTime: '17:00',
		daysOfWeek: [1, 2, 3, 4, 5],
		startDate: new Date('2024-01-01'),
		endDate: new Date('2024-12-31'),
		appointmentDuration: 30,
		breakDuration: 15,
		status: ScheduleStatus.ACTIVE,
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null as any,
		user: { id: 1 } as any,
		appointments: [],
	};

	const mockAppointment: Appointment = {
		id: 1,
		appointmentDate: new Date('2024-01-15'),
		startTime: '10:00',
		endTime: '10:30',
		status: AppointmentStatus.SCHEDULED,
		type: AppointmentType.CONSULTATION,
		notes: 'Test notes',
		reason: 'Regular checkup',
		googleCalendarEventId: null as any,
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null as any,
		veterinarian: { id: 1, email: 'vet@test.com' } as any,
		pet: { id: 1, name: 'Buddy', owner: { email: 'owner@test.com' } } as any,
		diagnostic: null as any,
		schedule: mockSchedule,
	};

	const mockGoogleCalendarService = {
		isInitialized: jest.fn(),
		syncAppointmentWithCalendar: jest.fn(),
		deleteEvent: jest.fn(),
	};

	const mockScheduleRepository = {
		create: jest.fn(),
		save: jest.fn(),
		findAndCount: jest.fn(),
		findOne: jest.fn(),
	};

	const mockAppointmentRepository = {
		create: jest.fn(),
		save: jest.fn(),
		findAndCount: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		createQueryBuilder: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AppointmentsService,
				{
					provide: getRepositoryToken(Schedule),
					useValue: mockScheduleRepository,
				},
				{
					provide: getRepositoryToken(Appointment),
					useValue: mockAppointmentRepository,
				},
				{
					provide: GoogleCalendarService,
					useValue: mockGoogleCalendarService,
				},
				{
					provide: GoogleAuthProvider,
					useValue: {},
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn((key: string) => {
							const config = {
								GOOGLE_CLIENT_ID: 'test-client-id',
								GOOGLE_CLIENT_SECRET: 'test-client-secret',
								GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
							};
							return config[key];
						}),
					},
				},
			],
		}).compile();

		service = module.get<AppointmentsService>(AppointmentsService);
		scheduleRepository = module.get<Repository<Schedule>>(getRepositoryToken(Schedule));
		appointmentRepository = module.get<Repository<Appointment>>(getRepositoryToken(Appointment));
		googleCalendarService = module.get<GoogleCalendarService>(GoogleCalendarService);

		// Reset mocks
		jest.clearAllMocks();
	});

	describe('Schedule Methods', () => {
		describe('createSchedule', () => {
			it('should create a schedule successfully', async () => {
				const createScheduleDto: CreateScheduleDto = {
					name: 'Test Schedule',
					description: 'Test Description',
					startTime: '09:00',
					endTime: '17:00',
					daysOfWeek: [1, 2, 3, 4, 5],
					startDate: '2024-01-01',
					endDate: '2024-12-31',
					appointmentDuration: 30,
					breakDuration: 15,
					status: ScheduleStatus.ACTIVE,
				};

				mockScheduleRepository.create.mockReturnValue(mockSchedule);
				mockScheduleRepository.save.mockResolvedValue(mockSchedule);

				const result = await service.createSchedule(createScheduleDto, 1);

				expect(mockScheduleRepository.create).toHaveBeenCalledWith({
					...createScheduleDto,
					user: { id: 1 },
				});
				expect(mockScheduleRepository.save).toHaveBeenCalledWith(mockSchedule);
				expect(result).toEqual(mockSchedule);
			});
		});

		describe('findAllSchedules', () => {
			it('should return paginated schedules for user', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				mockScheduleRepository.findAndCount.mockResolvedValue([[mockSchedule], 1]);

				const result = await service.findAllSchedules(1, paginationDto);

				expect(mockScheduleRepository.findAndCount).toHaveBeenCalledWith({
					where: { user: { id: 1 }, isDeleted: false },
					skip: 0,
					take: 10,
					order: { createdAt: 'DESC' },
				});
				expect(result).toEqual({ schedules: [mockSchedule], total: 1 });
			});

			it('should handle default pagination values', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				mockScheduleRepository.findAndCount.mockResolvedValue([[mockSchedule], 1]);

				const result = await service.findAllSchedules(1, paginationDto);

				expect(mockScheduleRepository.findAndCount).toHaveBeenCalledWith({
					where: { user: { id: 1 }, isDeleted: false },
					skip: 0,
					take: 10,
					order: { createdAt: 'DESC' },
				});
				expect(result).toEqual({ schedules: [mockSchedule], total: 1 });
			});
		});

		describe('findOneSchedule', () => {
			it('should return a schedule by id', async () => {
				mockScheduleRepository.findOne.mockResolvedValue(mockSchedule);

				const result = await service.findOneSchedule(1, 1);

				expect(mockScheduleRepository.findOne).toHaveBeenCalledWith({
					where: { id: 1, user: { id: 1 }, isDeleted: false },
					relations: ['appointments'],
				});
				expect(result).toEqual(mockSchedule);
			});

			it('should throw NotFoundException when schedule not found', async () => {
				mockScheduleRepository.findOne.mockResolvedValue(null);

				await expect(service.findOneSchedule(1, 1)).rejects.toThrow(
					new NotFoundException('Schedule with ID 1 not found')
				);
			});
		});

		describe('updateSchedule', () => {
			it('should update a schedule successfully', async () => {
				const updateScheduleDto: UpdateScheduleDto = { name: 'Updated Schedule' };
				const updatedSchedule = { ...mockSchedule, name: 'Updated Schedule' };

				jest.spyOn(service, 'findOneSchedule').mockResolvedValue(mockSchedule);
				mockScheduleRepository.save.mockResolvedValue(updatedSchedule);

				const result = await service.updateSchedule(1, updateScheduleDto, 1);

				expect(service.findOneSchedule).toHaveBeenCalledWith(1, 1);
				expect(mockScheduleRepository.save).toHaveBeenCalledWith(updatedSchedule);
				expect(result).toEqual(updatedSchedule);
			});
		});

		describe('removeSchedule', () => {
			it('should soft delete a schedule', async () => {
				jest.spyOn(service, 'findOneSchedule').mockResolvedValue(mockSchedule);
				mockScheduleRepository.save.mockResolvedValue({ ...mockSchedule, isDeleted: true });

				await service.removeSchedule(1, 1);

				expect(service.findOneSchedule).toHaveBeenCalledWith(1, 1);
				expect(mockScheduleRepository.save).toHaveBeenCalledWith({ ...mockSchedule, isDeleted: true });
			});
		});
	});

	describe('Appointment Methods', () => {
		describe('createAppointment', () => {
			it('should create an appointment successfully without Google Calendar sync', async () => {
				const createAppointmentDto: CreateAppointmentDto = {
					appointmentDate: '2024-01-15',
					startTime: '10:00',
					endTime: '10:30',
					status: AppointmentStatus.SCHEDULED,
					type: AppointmentType.CONSULTATION,
					notes: 'Test notes',
					reason: 'Regular checkup',
					veterinarianId: 1,
					petId: 1,
					scheduleId: 1,
				};

				jest.spyOn(service as any, 'checkTimeConflicts').mockResolvedValue(undefined);
				mockAppointmentRepository.create.mockReturnValue(mockAppointment);
				mockAppointmentRepository.save.mockResolvedValue(mockAppointment);
				mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
				mockGoogleCalendarService.isInitialized.mockReturnValue(false);

				const result = await service.createAppointment(createAppointmentDto);

				expect(service['checkTimeConflicts']).toHaveBeenCalledWith(
					createAppointmentDto.appointmentDate,
					createAppointmentDto.startTime,
					createAppointmentDto.endTime,
					createAppointmentDto.veterinarianId
				);
				expect(mockAppointmentRepository.create).toHaveBeenCalledWith({
					...createAppointmentDto,
					veterinarian: { id: createAppointmentDto.veterinarianId },
					pet: { id: createAppointmentDto.petId },
					schedule: { id: createAppointmentDto.scheduleId },
				});
				expect(mockAppointmentRepository.save).toHaveBeenCalledWith(mockAppointment);
				expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
					where: { id: mockAppointment.id },
					relations: ['veterinarian', 'pet', 'schedule', 'diagnostic']
				});
				expect(result).toEqual(mockAppointment);
			});

			it('should create an appointment with Google Calendar sync', async () => {
				const createAppointmentDto: CreateAppointmentDto = {
					appointmentDate: '2024-01-15',
					startTime: '10:00',
					endTime: '10:30',
					status: AppointmentStatus.SCHEDULED,
					type: AppointmentType.CONSULTATION,
					notes: 'Test notes',
					reason: 'Regular checkup',
					veterinarianId: 1,
					petId: 1,
					scheduleId: 1,
				};

				const googleEvent = { id: 'google-event-id' };

				jest.spyOn(service as any, 'checkTimeConflicts').mockResolvedValue(undefined);
				jest.spyOn(service as any, 'syncAppointmentWithGoogleCalendar').mockResolvedValue(undefined);
				mockAppointmentRepository.create.mockReturnValue(mockAppointment);
				mockAppointmentRepository.save.mockResolvedValue(mockAppointment);
				mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
				mockGoogleCalendarService.isInitialized.mockReturnValue(true);

				const result = await service.createAppointment(createAppointmentDto);

				expect(service['syncAppointmentWithGoogleCalendar']).toHaveBeenCalledWith(mockAppointment);
				expect(result).toEqual(mockAppointment);
			});

			it('should handle Google Calendar sync error gracefully', async () => {
				const createAppointmentDto: CreateAppointmentDto = {
					appointmentDate: '2024-01-15',
					startTime: '10:00',
					endTime: '10:30',
					status: AppointmentStatus.SCHEDULED,
					type: AppointmentType.CONSULTATION,
					notes: 'Test notes',
					reason: 'Regular checkup',
					veterinarianId: 1,
					petId: 1,
					scheduleId: 1,
				};

				jest.spyOn(service as any, 'checkTimeConflicts').mockResolvedValue(undefined);
				jest.spyOn(service as any, 'syncAppointmentWithGoogleCalendar').mockRejectedValue(new Error('Google API Error'));
				mockAppointmentRepository.create.mockReturnValue(mockAppointment);
				mockAppointmentRepository.save.mockResolvedValue(mockAppointment);
				mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
				mockGoogleCalendarService.isInitialized.mockReturnValue(true);

				const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

				const result = await service.createAppointment(createAppointmentDto);

				expect(consoleSpy).toHaveBeenCalledWith('Failed to sync appointment with Google Calendar:', expect.any(Error));
				expect(result).toEqual(mockAppointment);

				consoleSpy.mockRestore();
			});
		});

		describe('findAllAppointments', () => {
			it('should return paginated appointments', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				mockAppointmentRepository.findAndCount.mockResolvedValue([[mockAppointment], 1]);

				const result = await service.findAllAppointments(paginationDto);

				expect(mockAppointmentRepository.findAndCount).toHaveBeenCalledWith({
					where: { isDeleted: false },
					skip: 0,
					take: 10,
					order: { appointmentDate: 'ASC', startTime: 'ASC' },
				});
				expect(result).toEqual({ appointments: [mockAppointment], total: 1 });
			});
		});

		describe('findAppointmentsByVeterinarian', () => {
			it('should return appointments for a specific veterinarian', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				mockAppointmentRepository.findAndCount.mockResolvedValue([[mockAppointment], 1]);

				const result = await service.findAppointmentsByVeterinarian(1, paginationDto);

				expect(mockAppointmentRepository.findAndCount).toHaveBeenCalledWith({
					where: { veterinarian: { id: 1 }, isDeleted: false },
					skip: 0,
					take: 10,
					order: { appointmentDate: 'ASC', startTime: 'ASC' },
				});
				expect(result).toEqual({ appointments: [mockAppointment], total: 1 });
			});
		});

		describe('findAppointmentsByPet', () => {
			it('should return appointments for a specific pet', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				mockAppointmentRepository.findAndCount.mockResolvedValue([[mockAppointment], 1]);

				const result = await service.findAppointmentsByPet(1, paginationDto);

				expect(mockAppointmentRepository.findAndCount).toHaveBeenCalledWith({
					where: { pet: { id: 1 }, isDeleted: false },
					skip: 0,
					take: 10,
					order: { appointmentDate: 'ASC', startTime: 'ASC' },
				});
				expect(result).toEqual({ appointments: [mockAppointment], total: 1 });
			});
		});

		describe('findOneAppointment', () => {
			it('should return an appointment by id', async () => {
				mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

				const result = await service.findOneAppointment(1);

				expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
					where: { id: 1, isDeleted: false },
					relations: ['veterinarian', 'pet', 'diagnostic', 'schedule'],
				});
				expect(result).toEqual(mockAppointment);
			});

			it('should throw NotFoundException when appointment not found', async () => {
				mockAppointmentRepository.findOne.mockResolvedValue(null);

				await expect(service.findOneAppointment(1)).rejects.toThrow(
					new NotFoundException('Appointment with ID 1 not found')
				);
			});
		});

		describe('updateAppointment', () => {
			it('should update an appointment without time changes', async () => {
				const updateAppointmentDto: UpdateAppointmentDto = { notes: 'Updated notes' };
				const updatedAppointment = { ...mockAppointment, notes: 'Updated notes' };

				jest.spyOn(service, 'findOneAppointment').mockResolvedValue(mockAppointment);
				mockAppointmentRepository.update.mockResolvedValue({ affected: 1 });
				mockAppointmentRepository.findOne.mockResolvedValue(updatedAppointment);
				mockGoogleCalendarService.isInitialized.mockReturnValue(false);

				const result = await service.updateAppointment(1, updateAppointmentDto);

				expect(service.findOneAppointment).toHaveBeenCalledWith(1);
				expect(mockAppointmentRepository.update).toHaveBeenCalledWith(1, updateAppointmentDto);
				expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
					where: { id: 1 },
					relations: ['veterinarian', 'pet', 'schedule', 'diagnostic']
				});
				expect(result).toEqual(updatedAppointment);
			});

			it('should update an appointment with time changes', async () => {
				const updateAppointmentDto: UpdateAppointmentDto = {
					startTime: '11:00',
					endTime: '11:30',
				};
				const updatedAppointment = { ...mockAppointment, startTime: '11:00', endTime: '11:30' };

				jest.spyOn(service, 'findOneAppointment').mockResolvedValue(mockAppointment);
				jest.spyOn(service as any, 'checkTimeConflicts').mockResolvedValue(undefined);
				mockAppointmentRepository.update.mockResolvedValue({ affected: 1 });
				mockAppointmentRepository.findOne.mockResolvedValue(updatedAppointment);
				mockGoogleCalendarService.isInitialized.mockReturnValue(false);

				const result = await service.updateAppointment(1, updateAppointmentDto);

				expect(service['checkTimeConflicts']).toHaveBeenCalledWith(
					mockAppointment.appointmentDate,
					'11:00',
					'11:30',
					mockAppointment.veterinarian.id,
					1
				);
				expect(mockAppointmentRepository.update).toHaveBeenCalledWith(1, {
					startTime: '11:00',
					endTime: '11:30',
				});
				expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
					where: { id: 1 },
					relations: ['veterinarian', 'pet', 'schedule', 'diagnostic']
				});
				expect(result).toEqual(updatedAppointment);
			});

			it('should update an appointment with Google Calendar sync', async () => {
				const updateAppointmentDto: UpdateAppointmentDto = { notes: 'Updated notes' };
				const updatedAppointment = { ...mockAppointment, notes: 'Updated notes' };

				jest.spyOn(service, 'findOneAppointment').mockResolvedValue(mockAppointment);
				jest.spyOn(service as any, 'syncAppointmentWithGoogleCalendar').mockResolvedValue(undefined);
				mockAppointmentRepository.update.mockResolvedValue({ affected: 1 });
				mockAppointmentRepository.findOne.mockResolvedValue(updatedAppointment);
				mockGoogleCalendarService.isInitialized.mockReturnValue(true);

				const result = await service.updateAppointment(1, updateAppointmentDto);

				expect(mockAppointmentRepository.update).toHaveBeenCalledWith(1, updateAppointmentDto);
				expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
					where: { id: 1 },
					relations: ['veterinarian', 'pet', 'schedule', 'diagnostic']
				});
				expect(service['syncAppointmentWithGoogleCalendar']).toHaveBeenCalledWith(updatedAppointment);
				expect(result).toEqual(updatedAppointment);
			});
		});

		describe('removeAppointment', () => {
			it('should soft delete an appointment without Google Calendar event', async () => {
				jest.spyOn(service, 'findOneAppointment').mockResolvedValue(mockAppointment);
				mockAppointmentRepository.save.mockResolvedValue({ ...mockAppointment, isDeleted: true });
				mockGoogleCalendarService.isInitialized.mockReturnValue(false);

				await service.removeAppointment(1);

				expect(service.findOneAppointment).toHaveBeenCalledWith(1);
				expect(mockAppointmentRepository.save).toHaveBeenCalledWith({ ...mockAppointment, isDeleted: true });
			});

			it('should soft delete an appointment and remove from Google Calendar', async () => {
				const appointmentWithGoogleId = { ...mockAppointment, googleCalendarEventId: 'google-event-id' };
				jest.spyOn(service, 'findOneAppointment').mockResolvedValue(appointmentWithGoogleId);
				mockAppointmentRepository.save.mockResolvedValue({ ...appointmentWithGoogleId, isDeleted: true });
				mockGoogleCalendarService.isInitialized.mockReturnValue(true);
				mockGoogleCalendarService.deleteEvent.mockResolvedValue(undefined);

				await service.removeAppointment(1);

				expect(mockGoogleCalendarService.deleteEvent).toHaveBeenCalledWith('google-event-id');
			});

			it('should handle Google Calendar deletion error gracefully', async () => {
				const appointmentWithGoogleId = { ...mockAppointment, googleCalendarEventId: 'google-event-id' };
				jest.spyOn(service, 'findOneAppointment').mockResolvedValue(appointmentWithGoogleId);
				mockAppointmentRepository.save.mockResolvedValue({ ...appointmentWithGoogleId, isDeleted: true });
				mockGoogleCalendarService.isInitialized.mockReturnValue(true);
				mockGoogleCalendarService.deleteEvent.mockRejectedValue(new Error('Google API Error'));

				const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

				await service.removeAppointment(1);

				expect(consoleSpy).toHaveBeenCalledWith('Failed to delete appointment from Google Calendar:', expect.any(Error));

				consoleSpy.mockRestore();
			});
		});
	});

	describe('Private Methods', () => {
		describe('checkTimeConflicts', () => {
			it('should throw BadRequestException when start time is after end time', async () => {
				await expect(
					service['checkTimeConflicts']('2024-01-15', '11:00', '10:00', 1)
				).rejects.toThrow(new BadRequestException('Start time must be before end time'));
			});

			it('should throw ConflictException when there is a time conflict', async () => {
				const mockQueryBuilder = {
					where: jest.fn().mockReturnThis(),
					andWhere: jest.fn().mockReturnThis(),
					getOne: jest.fn().mockResolvedValue(mockAppointment),
				};
				mockAppointmentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

				await expect(
					service['checkTimeConflicts']('2024-01-15', '10:00', '10:30', 1)
				).rejects.toThrow(new ConflictException('There is already an appointment scheduled for this time slot'));
			});

			it('should not throw when there is no time conflict', async () => {
				const mockQueryBuilder = {
					where: jest.fn().mockReturnThis(),
					andWhere: jest.fn().mockReturnThis(),
					getOne: jest.fn().mockResolvedValue(null),
				};
				mockAppointmentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

				await expect(
					service['checkTimeConflicts']('2024-01-15', '10:00', '10:30', 1)
				).resolves.toBeUndefined();
			});

			it('should exclude appointment id when checking conflicts for updates', async () => {
				const mockQueryBuilder = {
					where: jest.fn().mockReturnThis(),
					andWhere: jest.fn().mockReturnThis(),
					getOne: jest.fn().mockResolvedValue(null),
				};
				mockAppointmentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

				await service['checkTimeConflicts']('2024-01-15', '10:00', '10:30', 1, 2);

				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('appointment.id != :excludeAppointmentId', { excludeAppointmentId: 2 });
			});
		});

		describe('syncAppointmentWithGoogleCalendar', () => {
			it('should sync appointment with Google Calendar and update event ID', async () => {
				const googleEvent = { id: 'google-event-id' };
				const appointmentWithoutGoogleId = { ...mockAppointment, googleCalendarEventId: null as any };

				mockGoogleCalendarService.syncAppointmentWithCalendar.mockResolvedValue(googleEvent);
				mockAppointmentRepository.update.mockResolvedValue({ affected: 1 });

				await service['syncAppointmentWithGoogleCalendar'](appointmentWithoutGoogleId);

				expect(mockGoogleCalendarService.syncAppointmentWithCalendar).toHaveBeenCalledWith(
					expect.objectContaining({
						appointmentId: mockAppointment.id,
						title: `${mockAppointment.type} - ${mockAppointment.pet.name}`,
						description: mockAppointment.notes || mockAppointment.reason || 'Veterinary appointment',
						veterinarianEmail: mockAppointment.veterinarian.email,
						petOwnerEmail: mockAppointment.pet.owner?.email,
					}),
					null
				);
				expect(mockAppointmentRepository.update).toHaveBeenCalledWith(appointmentWithoutGoogleId.id, {
					googleCalendarEventId: 'google-event-id',
				});
			});

			it('should sync appointment with existing Google Calendar event', async () => {
				const googleEvent = { id: 'google-event-id' };
				const appointmentWithGoogleId = { ...mockAppointment, googleCalendarEventId: 'existing-id' };

				mockGoogleCalendarService.syncAppointmentWithCalendar.mockResolvedValue(googleEvent);

				await service['syncAppointmentWithGoogleCalendar'](appointmentWithGoogleId);

				expect(mockGoogleCalendarService.syncAppointmentWithCalendar).toHaveBeenCalledWith(
					expect.any(Object),
					'existing-id'
				);
				expect(mockAppointmentRepository.update).not.toHaveBeenCalled();
			});
		});
	});
});
