import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarService } from './google-calendar.service';
import { AppointmentCalendarEvent, GoogleCalendarEvent, GoogleCalendarEventResponse } from './interfaces/google-calendar.interface';
import { GoogleAuthProvider } from './provider/google-auth.provider';

describe('GoogleCalendarService', () => {
	let service: GoogleCalendarService;
	let googleAuthProvider: GoogleAuthProvider;

	const mockGoogleAuthProvider = {
		setCredentials: jest.fn(),
		getOAuth2Client: jest.fn(),
		generateAuthUrl: jest.fn(),
		getTokensFromCode: jest.fn(),
	};

	const mockOAuth2Client = {
		setCredentials: jest.fn(),
	};

	const mockCalendar = {
		events: {
			insert: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			get: jest.fn(),
			list: jest.fn(),
		},
	};

	const mockGoogleEvent: GoogleCalendarEvent = {
		summary: 'Test Event',
		description: 'Test Description',
		start: {
			dateTime: '2024-01-15T10:00:00Z',
			timeZone: 'America/Mexico_City',
		},
		end: {
			dateTime: '2024-01-15T10:30:00Z',
			timeZone: 'America/Mexico_City',
		},
		attendees: [
			{
				email: 'vet@test.com',
				responseStatus: 'accepted',
			},
		],
		location: 'Veterinary Clinic',
	};

	const mockGoogleEventResponse: GoogleCalendarEventResponse = {
		id: 'google-event-id',
		summary: 'Test Event',
		description: 'Test Description',
		start: {
			dateTime: '2024-01-15T10:00:00Z',
			timeZone: 'America/Mexico_City',
		},
		end: {
			dateTime: '2024-01-15T10:30:00Z',
			timeZone: 'America/Mexico_City',
		},
		attendees: [
			{
				email: 'vet@test.com',
				responseStatus: 'accepted',
			},
		],
		location: 'Veterinary Clinic',
		status: 'confirmed',
		visibility: 'default',
		created: '2024-01-01T00:00:00Z',
		updated: '2024-01-01T00:00:00Z',
		htmlLink: 'https://calendar.google.com/event/test',
	};

	const mockAppointmentEvent: AppointmentCalendarEvent = {
		appointmentId: 1,
		title: 'Consultation - Buddy',
		description: 'Regular checkup',
		startDateTime: new Date('2024-01-15T10:00:00Z'),
		endDateTime: new Date('2024-01-15T10:30:00Z'),
		veterinarianEmail: 'vet@test.com',
		petOwnerEmail: 'owner@test.com',
		location: 'Veterinary Clinic',
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GoogleCalendarService,
				{
					provide: GoogleAuthProvider,
					useValue: mockGoogleAuthProvider,
				},
			],
		}).compile();

		service = module.get<GoogleCalendarService>(GoogleCalendarService);
		googleAuthProvider = module.get<GoogleAuthProvider>(GoogleAuthProvider);

		// Reset mocks
		jest.clearAllMocks();
	});

	describe('initialize', () => {
		it('should initialize the service with tokens', async () => {
			const tokens = { access_token: 'test-token' };
			mockGoogleAuthProvider.getOAuth2Client.mockReturnValue(mockOAuth2Client);

			// Mock google.calendar
			const mockGoogle = {
				calendar: jest.fn().mockReturnValue(mockCalendar),
			};
			jest.doMock('googleapis', () => ({ google: mockGoogle }));

			await service.initialize(tokens);

			expect(mockGoogleAuthProvider.setCredentials).toHaveBeenCalledWith(tokens);
		});
	});

	describe('createEvent', () => {
		beforeEach(() => {
			// Mock the calendar property
			(service as any).calendar = mockCalendar;
		});

		it('should create an event successfully', async () => {
			mockCalendar.events.insert.mockResolvedValue({ data: mockGoogleEventResponse });

			const result = await service.createEvent(mockGoogleEvent);

			expect(mockCalendar.events.insert).toHaveBeenCalledWith({
				calendarId: 'primary',
				requestBody: mockGoogleEvent,
			});
			expect(result).toEqual(mockGoogleEventResponse);
		});

		it('should throw BadRequestException when service is not initialized', async () => {
			(service as any).calendar = null;

			await expect(service.createEvent(mockGoogleEvent)).rejects.toThrow('Failed to create calendar event');
		});

		it('should handle API errors gracefully', async () => {
			mockCalendar.events.insert.mockRejectedValue(new Error('API Error'));

			await expect(service.createEvent(mockGoogleEvent)).rejects.toThrow('Failed to create calendar event');
		});
	});

	describe('updateEvent', () => {
		beforeEach(() => {
			(service as any).calendar = mockCalendar;
		});

		it('should update an event successfully', async () => {
			const eventId = 'google-event-id';
			mockCalendar.events.update.mockResolvedValue({ data: mockGoogleEventResponse });

			const result = await service.updateEvent(eventId, mockGoogleEvent);

			expect(mockCalendar.events.update).toHaveBeenCalledWith({
				calendarId: 'primary',
				eventId: eventId,
				requestBody: mockGoogleEvent,
			});
			expect(result).toEqual(mockGoogleEventResponse);
		});

		it('should throw BadRequestException when service is not initialized', async () => {
			(service as any).calendar = null;

			await expect(service.updateEvent('event-id', mockGoogleEvent)).rejects.toThrow('Failed to update calendar event');
		});

		it('should handle API errors gracefully', async () => {
			mockCalendar.events.update.mockRejectedValue(new Error('API Error'));

			await expect(service.updateEvent('event-id', mockGoogleEvent)).rejects.toThrow('Failed to update calendar event');
		});
	});

	describe('deleteEvent', () => {
		beforeEach(() => {
			(service as any).calendar = mockCalendar;
		});

		it('should delete an event successfully', async () => {
			const eventId = 'google-event-id';
			mockCalendar.events.delete.mockResolvedValue(undefined);

			await service.deleteEvent(eventId);

			expect(mockCalendar.events.delete).toHaveBeenCalledWith({
				calendarId: 'primary',
				eventId: eventId,
			});
		});

		it('should throw BadRequestException when service is not initialized', async () => {
			(service as any).calendar = null;

			await expect(service.deleteEvent('event-id')).rejects.toThrow('Failed to delete calendar event');
		});

		it('should handle API errors gracefully', async () => {
			mockCalendar.events.delete.mockRejectedValue(new Error('API Error'));

			await expect(service.deleteEvent('event-id')).rejects.toThrow('Failed to delete calendar event');
		});
	});

	describe('getEvent', () => {
		beforeEach(() => {
			(service as any).calendar = mockCalendar;
		});

		it('should get an event successfully', async () => {
			const eventId = 'google-event-id';
			mockCalendar.events.get.mockResolvedValue({ data: mockGoogleEventResponse });

			const result = await service.getEvent(eventId);

			expect(mockCalendar.events.get).toHaveBeenCalledWith({
				calendarId: 'primary',
				eventId: eventId,
			});
			expect(result).toEqual(mockGoogleEventResponse);
		});

		it('should throw BadRequestException when service is not initialized', async () => {
			(service as any).calendar = null;

			await expect(service.getEvent('event-id')).rejects.toThrow('Calendar event not found');
		});

		it('should throw NotFoundException when event is not found', async () => {
			mockCalendar.events.get.mockRejectedValue(new Error('Not found'));

			await expect(service.getEvent('event-id')).rejects.toThrow(
				new NotFoundException('Calendar event not found')
			);
		});
	});

	describe('listEvents', () => {
		beforeEach(() => {
			(service as any).calendar = mockCalendar;
		});

		it('should list events successfully', async () => {
			const timeMin = new Date('2024-01-01');
			const timeMax = new Date('2024-01-31');
			const mockEvents = [mockGoogleEventResponse];
			mockCalendar.events.list.mockResolvedValue({ data: { items: mockEvents } });

			const result = await service.listEvents(timeMin, timeMax);

			expect(mockCalendar.events.list).toHaveBeenCalledWith({
				calendarId: 'primary',
				timeMin: timeMin.toISOString(),
				timeMax: timeMax.toISOString(),
				singleEvents: true,
				orderBy: 'startTime',
			});
			expect(result).toEqual(mockEvents);
		});

		it('should throw BadRequestException when service is not initialized', async () => {
			(service as any).calendar = null;

			await expect(service.listEvents(new Date(), new Date())).rejects.toThrow('Failed to list calendar events');
		});

		it('should handle API errors gracefully', async () => {
			mockCalendar.events.list.mockRejectedValue(new Error('API Error'));

			await expect(service.listEvents(new Date(), new Date())).rejects.toThrow('Failed to list calendar events');
		});
	});

	describe('convertAppointmentToCalendarEvent', () => {
		it('should convert appointment to calendar event with all fields', () => {
			const result = service.convertAppointmentToCalendarEvent(mockAppointmentEvent);

			expect(result).toEqual({
				summary: mockAppointmentEvent.title,
				description: mockAppointmentEvent.description,
				start: {
					dateTime: mockAppointmentEvent.startDateTime.toISOString(),
					timeZone: 'America/Mexico_City',
				},
				end: {
					dateTime: mockAppointmentEvent.endDateTime.toISOString(),
					timeZone: 'America/Mexico_City',
				},
				attendees: [
					{
						email: mockAppointmentEvent.veterinarianEmail,
						responseStatus: 'accepted',
					},
					{
						email: mockAppointmentEvent.petOwnerEmail,
						responseStatus: 'needsAction',
					},
				],
				location: mockAppointmentEvent.location,
				reminders: {
					useDefault: false,
					overrides: [
						{ method: 'email', minutes: 24 * 60 },
						{ method: 'popup', minutes: 30 },
					],
				},
			});
		});

		it('should convert appointment to calendar event without pet owner email', () => {
			const appointmentWithoutOwner = { ...mockAppointmentEvent, petOwnerEmail: undefined };
			const result = service.convertAppointmentToCalendarEvent(appointmentWithoutOwner);

			expect(result.attendees).toEqual([
				{
					email: mockAppointmentEvent.veterinarianEmail,
					responseStatus: 'accepted',
				},
			]);
		});
	});

	describe('syncAppointmentWithCalendar', () => {
		beforeEach(() => {
			(service as any).calendar = mockCalendar;
		});

		it('should create new event when no googleEventId provided', async () => {
			jest.spyOn(service, 'convertAppointmentToCalendarEvent').mockReturnValue(mockGoogleEvent);
			jest.spyOn(service, 'createEvent').mockResolvedValue(mockGoogleEventResponse);

			const result = await service.syncAppointmentWithCalendar(mockAppointmentEvent);

			expect(service.convertAppointmentToCalendarEvent).toHaveBeenCalledWith(mockAppointmentEvent);
			expect(service.createEvent).toHaveBeenCalledWith(mockGoogleEvent);
			expect(result).toEqual(mockGoogleEventResponse);
		});

		it('should update existing event when googleEventId provided', async () => {
			const googleEventId = 'existing-event-id';
			jest.spyOn(service, 'convertAppointmentToCalendarEvent').mockReturnValue(mockGoogleEvent);
			jest.spyOn(service, 'updateEvent').mockResolvedValue(mockGoogleEventResponse);

			const result = await service.syncAppointmentWithCalendar(mockAppointmentEvent, googleEventId);

			expect(service.convertAppointmentToCalendarEvent).toHaveBeenCalledWith(mockAppointmentEvent);
			expect(service.updateEvent).toHaveBeenCalledWith(googleEventId, mockGoogleEvent);
			expect(result).toEqual(mockGoogleEventResponse);
		});
	});

	describe('generateAuthUrl', () => {
		it('should generate auth URL', () => {
			const authUrl = 'https://accounts.google.com/oauth/authorize?test';
			mockGoogleAuthProvider.generateAuthUrl.mockReturnValue(authUrl);

			const result = service.generateAuthUrl();

			expect(mockGoogleAuthProvider.generateAuthUrl).toHaveBeenCalled();
			expect(result).toBe(authUrl);
		});
	});

	describe('getTokensFromCode', () => {
		it('should get tokens from code', async () => {
			const code = 'auth-code';
			const tokens = { access_token: 'test-token' };
			mockGoogleAuthProvider.getTokensFromCode.mockResolvedValue(tokens);

			const result = await service.getTokensFromCode(code);

			expect(mockGoogleAuthProvider.getTokensFromCode).toHaveBeenCalledWith(code);
			expect(result).toEqual(tokens);
		});
	});

	describe('isInitialized', () => {
		it('should return true when calendar is initialized', () => {
			(service as any).calendar = mockCalendar;

			const result = service.isInitialized();

			expect(result).toBe(true);
		});

		it('should return false when calendar is not initialized', () => {
			(service as any).calendar = null;

			const result = service.isInitialized();

			expect(result).toBe(false);
		});
	});
});
