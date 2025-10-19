import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleAuthProvider } from './provider/google-auth.provider';

describe('GoogleCalendarController', () => {
	let controller: GoogleCalendarController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GoogleCalendarController],
			providers: [
				GoogleCalendarService,
				GoogleAuthProvider,
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

		controller = module.get<GoogleCalendarController>(GoogleCalendarController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
