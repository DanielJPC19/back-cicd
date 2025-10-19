import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { UserContextDto } from '../../../common/dto/user-context.dto';
import { CalendarQueryDto, OAuthCallbackDto } from './dto/calendar-query.dto';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleAuthProvider } from './provider/google-auth.provider';

describe('GoogleCalendarController', () => {
	let controller: GoogleCalendarController;
	let service: GoogleCalendarService;

	const mockGoogleCalendarService = {
		generateAuthUrl: jest.fn(),
		getTokensFromCode: jest.fn(),
		initialize: jest.fn(),
		isInitialized: jest.fn(),
		listEvents: jest.fn(),
	};

	const mockUser: UserContextDto = {
		userId: 1,
		email: 'test@example.com',
		role: 'VETERINARIAN',
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GoogleCalendarController],
			providers: [
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

		controller = module.get<GoogleCalendarController>(GoogleCalendarController);
		service = module.get<GoogleCalendarService>(GoogleCalendarService);

		// Reset mocks
		jest.clearAllMocks();
	});

	describe('getAuthUrl', () => {
		it('should return authorization URL successfully', async () => {
			const authUrl = 'https://accounts.google.com/oauth/authorize?...';
			mockGoogleCalendarService.generateAuthUrl.mockReturnValue(authUrl);

			const result = await controller.getAuthUrl();

			expect(mockGoogleCalendarService.generateAuthUrl).toHaveBeenCalled();
			expect(result).toEqual({
				authUrl,
				message: 'Please visit this URL to authorize Google Calendar access',
			});
		});

		it('should throw BadRequestException when authUrl is empty', async () => {
			mockGoogleCalendarService.generateAuthUrl.mockReturnValue('');

			await expect(controller.getAuthUrl()).rejects.toThrow(BadRequestException);
		});
	});

	describe('handleCallback', () => {
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		it('should handle OAuth callback successfully', async () => {
			const callbackDto: OAuthCallbackDto = { code: 'auth-code-123' };
			const tokens = {
				access_token: 'access-token',
				refresh_token: 'refresh-token',
				expiry_date: Date.now() + 3600000,
				scope: 'https://www.googleapis.com/auth/calendar',
			};

			mockGoogleCalendarService.getTokensFromCode.mockResolvedValue(tokens);
			mockGoogleCalendarService.initialize.mockResolvedValue(undefined);

			await controller.handleCallback(callbackDto, mockUser, mockResponse);

			expect(mockGoogleCalendarService.getTokensFromCode).toHaveBeenCalledWith('auth-code-123');
			expect(mockGoogleCalendarService.initialize).toHaveBeenCalledWith(tokens);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Google Calendar connected successfully',
				status: 'connected',
				user: mockUser.email,
				tokens: {
					access_token: '***',
					refresh_token: '***',
					expiry_date: tokens.expiry_date,
					scope: tokens.scope,
				},
			});
		});

		it('should return error when code is missing', async () => {
			const callbackDto: OAuthCallbackDto = { code: '' };

			await controller.handleCallback(callbackDto, mockUser, mockResponse);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: 'Authorization code is required',
				message: 'Please provide a valid authorization code from Google',
			});
		});
	});

	describe('getConnectionStatus', () => {
		it('should return connected status when service is initialized', async () => {
			mockGoogleCalendarService.isInitialized.mockReturnValue(true);

			const result = await controller.getConnectionStatus(mockUser);

			expect(result).toEqual({
				connected: true,
				user: mockUser.email,
				message: 'Google Calendar is connected and ready to use',
				status: 'active',
				lastSync: null,
			});
		});

		it('should return disconnected status when service is not initialized', async () => {
			mockGoogleCalendarService.isInitialized.mockReturnValue(false);

			const result = await controller.getConnectionStatus(mockUser);

			expect(result).toEqual({
				connected: false,
				user: mockUser.email,
				message: 'Google Calendar integration not configured. Please authorize access first.',
				status: 'inactive',
				lastSync: null,
			});
		});
	});

	describe('listEvents', () => {
		it('should list events successfully', async () => {
			const queryDto: CalendarQueryDto = {
				timeMin: '2024-01-01T00:00:00Z',
				timeMax: '2024-01-07T23:59:59Z',
			};
			const events = [{ id: 'event1', summary: 'Test Event' }];

			mockGoogleCalendarService.isInitialized.mockReturnValue(true);
			mockGoogleCalendarService.listEvents.mockResolvedValue(events);

			const result = await controller.listEvents(queryDto, mockUser);

			expect(mockGoogleCalendarService.listEvents).toHaveBeenCalled();
			expect(result.events).toEqual(events);
			expect(result.count).toBe(1);
		});

		it('should throw error when service not initialized', async () => {
			const queryDto: CalendarQueryDto = {};
			mockGoogleCalendarService.isInitialized.mockReturnValue(false);

			await expect(controller.listEvents(queryDto, mockUser)).rejects.toThrow(BadRequestException);
		});
	});

	describe('disconnect', () => {
		it('should disconnect successfully', async () => {
			const result = await controller.disconnect(mockUser);

			expect(result).toEqual({
				message: 'Google Calendar disconnected successfully',
				user: mockUser.email,
				status: 'disconnected',
				note: 'You will need to re-authorize to use Google Calendar features again',
			});
		});
	});
});
