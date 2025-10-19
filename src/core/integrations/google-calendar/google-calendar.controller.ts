import { BadRequestException, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { User } from '../../../common/decorators/user.decorator';
import { UserContextDto } from '../../../common/dto/user-context.dto';
import { CalendarQueryDto, OAuthCallbackDto } from './dto/calendar-query.dto';
import { GoogleCalendarService } from './google-calendar.service';

@ApiTags('google-calendar')
@ApiBearerAuth('jwt-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('google-calendar')
export class GoogleCalendarController {
	constructor(private readonly googleCalendarService: GoogleCalendarService) {}

	@Get('auth-url')
	@ApiOperation({ summary: 'Get Google Calendar authorization URL' })
	@ApiResponse({ status: 200, description: 'Authorization URL generated successfully' })
	@ApiResponse({ status: 500, description: 'Failed to generate authorization URL' })
	async getAuthUrl() {
		try {
			const authUrl = this.googleCalendarService.generateAuthUrl();
			if (!authUrl) {
				throw new BadRequestException('Failed to generate authorization URL');
			}
			return { 
				authUrl,
				message: 'Please visit this URL to authorize Google Calendar access'
			};
		} catch (error) {
			throw new BadRequestException('Failed to generate Google Calendar authorization URL: ' + error.message);
		}
	}

	@Get('callback')
	@ApiOperation({ summary: 'Handle Google Calendar OAuth callback' })
	@ApiResponse({ status: 200, description: 'OAuth callback handled successfully' })
	@ApiResponse({ status: 400, description: 'Invalid authorization code or callback failed' })
	async handleCallback(@Query() callbackDto: OAuthCallbackDto, @User() user: UserContextDto, @Res() res: Response) {
		try {
			if (!callbackDto.code) {
				return res.status(400).json({ 
					error: 'Authorization code is required',
					message: 'Please provide a valid authorization code from Google'
				});
			}

			const tokens = await this.googleCalendarService.getTokensFromCode(callbackDto.code);
			
			if (!tokens || !tokens.access_token) {
				return res.status(400).json({ 
					error: 'Invalid tokens received from Google',
					message: 'Failed to obtain valid access tokens'
				});
			}

			// Inicializar el servicio con los tokens obtenidos
			await this.googleCalendarService.initialize(tokens);
			
			// TODO: Aquí deberías guardar los tokens en la base de datos asociados al usuario
			// const userId = req.user.id;
			// await this.saveUserTokens(userId, tokens);
			
			return res.json({
				message: 'Google Calendar connected successfully',
				status: 'connected',
				user: user.email || 'Unknown user',
				tokens: {
					access_token: tokens.access_token ? '***' : null,
					refresh_token: tokens.refresh_token ? '***' : null,
					expiry_date: tokens.expiry_date,
					scope: tokens.scope
				},
			});
		} catch (error) {
			return res.status(400).json({ 
				error: 'Failed to process OAuth callback',
				message: error.message || 'Unknown error occurred',
				details: 'Please try the authorization process again'
			});
		}
	}

	@Get('status')
	@ApiOperation({ summary: 'Check Google Calendar connection status' })
	@ApiResponse({ status: 200, description: 'Connection status retrieved successfully' })
	async getConnectionStatus(@User() user: UserContextDto) {
		try {
			const isInitialized = this.googleCalendarService.isInitialized();
			
			// TODO: Aquí deberías verificar si el usuario tiene tokens guardados en la base de datos
			// const userId = req.user.id;
			// const userTokens = await this.getUserTokens(userId);
			// const isConnected = userTokens && userTokens.access_token;
			
			return {
				connected: isInitialized,
				user: user.email || 'Unknown user',
				message: isInitialized 
					? 'Google Calendar is connected and ready to use'
					: 'Google Calendar integration not configured. Please authorize access first.',
				status: isInitialized ? 'active' : 'inactive',
				lastSync: null, // TODO: Implementar tracking de última sincronización
			};
		} catch (error) {
			return {
				connected: false,
				message: 'Error checking Google Calendar status: ' + error.message,
				status: 'error'
			};
		}
	}

	@Get('events')
	@ApiOperation({ summary: 'List Google Calendar events for a date range' })
	@ApiResponse({ status: 200, description: 'Events retrieved successfully' })
	@ApiResponse({ status: 400, description: 'Invalid date range or service not initialized' })
	async listEvents(
		@Query() queryDto: CalendarQueryDto,
		@User() user: UserContextDto
	) {
		try {
			if (!this.googleCalendarService.isInitialized()) {
				throw new BadRequestException('Google Calendar service not initialized. Please authorize access first.');
			}

			// Default to current week if no dates provided
			const defaultTimeMin = queryDto.timeMin ? new Date(queryDto.timeMin) : new Date();
			const defaultTimeMax = queryDto.timeMax ? new Date(queryDto.timeMax) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

			if (defaultTimeMin >= defaultTimeMax) {
				throw new BadRequestException('timeMin must be before timeMax');
			}

			const events = await this.googleCalendarService.listEvents(defaultTimeMin, defaultTimeMax);

			return {
				message: 'Events retrieved successfully',
				user: user.email || 'Unknown user',
				timeRange: {
					from: defaultTimeMin.toISOString(),
					to: defaultTimeMax.toISOString()
				},
				count: events.length,
				events
			};
		} catch (error) {
			throw new BadRequestException('Failed to retrieve Google Calendar events: ' + error.message);
		}
	}

	@Post('disconnect')
	@ApiOperation({ summary: 'Disconnect Google Calendar integration' })
	@ApiResponse({ status: 200, description: 'Google Calendar disconnected successfully' })
	@ApiResponse({ status: 400, description: 'Failed to disconnect' })
	async disconnect(@User() user: UserContextDto) {
		try {
			// TODO: Implementar revocación de tokens y limpieza de base de datos
			// const userId = req.user.id;
			// await this.revokeUserTokens(userId);
			
			return {
				message: 'Google Calendar disconnected successfully',
				user: user.email || 'Unknown user',
				status: 'disconnected',
				note: 'You will need to re-authorize to use Google Calendar features again'
			};
		} catch (error) {
			throw new BadRequestException('Failed to disconnect Google Calendar: ' + error.message);
		}
	}
}
