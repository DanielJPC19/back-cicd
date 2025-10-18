import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoogleCalendarService } from '../../core/integrations/google-calendar/google-calendar.service';
import { GoogleAuthProvider } from '../../core/integrations/google-calendar/provider/google-auth.provider';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from './entities/schedule.entity';

describe('AppointmentsController', () => {
	let controller: AppointmentsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AppointmentsController],
			providers: [
				AppointmentsService,
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
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
