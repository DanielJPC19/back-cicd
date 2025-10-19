import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GoogleCalendarService } from '../../core/integrations/google-calendar/google-calendar.service';
import { GoogleAuthProvider } from '../../core/integrations/google-calendar/provider/google-auth.provider';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';
import { Schedule, ScheduleStatus } from './entities/schedule.entity';

describe('AppointmentsController', () => {
	let controller: AppointmentsController;
	let service: AppointmentsService;

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
		deletedAt: null,
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
		googleCalendarEventId: null,
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		veterinarian: { id: 1, email: 'vet@test.com' } as any,
		pet: { id: 1, name: 'Buddy', owner: { email: 'owner@test.com' } } as any,
		diagnostic: null,
		schedule: mockSchedule,
	};

	const mockAppointmentsService = {
		createSchedule: jest.fn(),
		findAllSchedules: jest.fn(),
		findOneSchedule: jest.fn(),
		updateSchedule: jest.fn(),
		removeSchedule: jest.fn(),
		createAppointment: jest.fn(),
		findAllAppointments: jest.fn(),
		findAppointmentsByVeterinarian: jest.fn(),
		findAppointmentsByPet: jest.fn(),
		findOneAppointment: jest.fn(),
		updateAppointment: jest.fn(),
		removeAppointment: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AppointmentsController],
			providers: [
				{
					provide: AppointmentsService,
					useValue: mockAppointmentsService,
				},
				{
					provide: getRepositoryToken(Schedule),
					useValue: {},
				},
				{
					provide: getRepositoryToken(Appointment),
					useValue: {},
				},
				{
					provide: GoogleCalendarService,
					useValue: {
						isInitialized: jest.fn().mockReturnValue(false),
						syncAppointmentWithCalendar: jest.fn(),
						deleteEvent: jest.fn(),
					},
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

		controller = module.get<AppointmentsController>(AppointmentsController);
		service = module.get<AppointmentsService>(AppointmentsService);

		// Reset mocks
		jest.clearAllMocks();
	});

	describe('Schedule Endpoints', () => {
		describe('createSchedule', () => {
			it('should create a schedule', async () => {
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

				const mockRequest = { user: { id: 1 } };
				mockAppointmentsService.createSchedule.mockResolvedValue(mockSchedule);

				const result = await controller.createSchedule(createScheduleDto, mockRequest);

				expect(mockAppointmentsService.createSchedule).toHaveBeenCalledWith(createScheduleDto, 1);
				expect(result).toEqual(mockSchedule);
			});
		});

		describe('findAllSchedules', () => {
			it('should return all schedules for user', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				const mockRequest = { user: { id: 1 } };
				const expectedResult = { schedules: [mockSchedule], total: 1 };

				mockAppointmentsService.findAllSchedules.mockResolvedValue(expectedResult);

				const result = await controller.findAllSchedules(paginationDto, mockRequest);

				expect(mockAppointmentsService.findAllSchedules).toHaveBeenCalledWith(1, paginationDto);
				expect(result).toEqual(expectedResult);
			});
		});

		describe('findOneSchedule', () => {
			it('should return a schedule by id', async () => {
				const mockRequest = { user: { id: 1 } };
				mockAppointmentsService.findOneSchedule.mockResolvedValue(mockSchedule);

				const result = await controller.findOneSchedule('1', mockRequest);

				expect(mockAppointmentsService.findOneSchedule).toHaveBeenCalledWith(1, 1);
				expect(result).toEqual(mockSchedule);
			});
		});

		describe('updateSchedule', () => {
			it('should update a schedule', async () => {
				const updateScheduleDto: UpdateScheduleDto = { name: 'Updated Schedule' };
				const mockRequest = { user: { id: 1 } };
				const updatedSchedule = { ...mockSchedule, name: 'Updated Schedule' };

				mockAppointmentsService.updateSchedule.mockResolvedValue(updatedSchedule);

				const result = await controller.updateSchedule('1', updateScheduleDto, mockRequest);

				expect(mockAppointmentsService.updateSchedule).toHaveBeenCalledWith(1, updateScheduleDto, 1);
				expect(result).toEqual(updatedSchedule);
			});
		});

		describe('removeSchedule', () => {
			it('should delete a schedule', async () => {
				const mockRequest = { user: { id: 1 } };
				mockAppointmentsService.removeSchedule.mockResolvedValue(undefined);

				const result = await controller.removeSchedule('1', mockRequest);

				expect(mockAppointmentsService.removeSchedule).toHaveBeenCalledWith(1, 1);
				expect(result).toEqual({ message: 'Schedule deleted successfully' });
			});
		});
	});

	describe('Appointment Endpoints', () => {
		describe('createAppointment', () => {
			it('should create an appointment', async () => {
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

				mockAppointmentsService.createAppointment.mockResolvedValue(mockAppointment);

				const result = await controller.createAppointment(createAppointmentDto);

				expect(mockAppointmentsService.createAppointment).toHaveBeenCalledWith(createAppointmentDto);
				expect(result).toEqual(mockAppointment);
			});
		});

		describe('findAllAppointments', () => {
			it('should return all appointments', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				const expectedResult = { appointments: [mockAppointment], total: 1 };

				mockAppointmentsService.findAllAppointments.mockResolvedValue(expectedResult);

				const result = await controller.findAllAppointments(paginationDto);

				expect(mockAppointmentsService.findAllAppointments).toHaveBeenCalledWith(paginationDto);
				expect(result).toEqual(expectedResult);
			});
		});

		describe('findAppointmentsByVeterinarian', () => {
			it('should return appointments by veterinarian id', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				const expectedResult = { appointments: [mockAppointment], total: 1 };

				mockAppointmentsService.findAppointmentsByVeterinarian.mockResolvedValue(expectedResult);

				const result = await controller.findAppointmentsByVeterinarian('1', paginationDto);

				expect(mockAppointmentsService.findAppointmentsByVeterinarian).toHaveBeenCalledWith(1, paginationDto);
				expect(result).toEqual(expectedResult);
			});
		});

		describe('findAppointmentsByPet', () => {
			it('should return appointments by pet id', async () => {
				const paginationDto: PaginationDto = { page: 1, limit: 10 };
				const expectedResult = { appointments: [mockAppointment], total: 1 };

				mockAppointmentsService.findAppointmentsByPet.mockResolvedValue(expectedResult);

				const result = await controller.findAppointmentsByPet('1', paginationDto);

				expect(mockAppointmentsService.findAppointmentsByPet).toHaveBeenCalledWith(1, paginationDto);
				expect(result).toEqual(expectedResult);
			});
		});

		describe('findOneAppointment', () => {
			it('should return an appointment by id', async () => {
				mockAppointmentsService.findOneAppointment.mockResolvedValue(mockAppointment);

				const result = await controller.findOneAppointment('1');

				expect(mockAppointmentsService.findOneAppointment).toHaveBeenCalledWith(1);
				expect(result).toEqual(mockAppointment);
			});
		});

		describe('updateAppointment', () => {
			it('should update an appointment', async () => {
				const updateAppointmentDto: UpdateAppointmentDto = { notes: 'Updated notes' };
				const updatedAppointment = { ...mockAppointment, notes: 'Updated notes' };

				mockAppointmentsService.updateAppointment.mockResolvedValue(updatedAppointment);

				const result = await controller.updateAppointment('1', updateAppointmentDto);

				expect(mockAppointmentsService.updateAppointment).toHaveBeenCalledWith(1, updateAppointmentDto);
				expect(result).toEqual(updatedAppointment);
			});
		});

		describe('removeAppointment', () => {
			it('should delete an appointment', async () => {
				mockAppointmentsService.removeAppointment.mockResolvedValue(undefined);

				const result = await controller.removeAppointment('1');

				expect(mockAppointmentsService.removeAppointment).toHaveBeenCalledWith(1);
				expect(result).toEqual({ message: 'Appointment deleted successfully' });
			});
		});
	});
});
