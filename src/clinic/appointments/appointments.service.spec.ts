import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoogleCalendarService } from '../../core/integrations/google-calendar/google-calendar.service';
import { GoogleAuthProvider } from '../../core/integrations/google-calendar/provider/google-auth.provider';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from './entities/schedule.entity';

describe('AppointmentsService', () => {
	let service: AppointmentsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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

		service = module.get<AppointmentsService>(AppointmentsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
