import { Controller, Get, Query, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
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
	async getAuthUrl() {
		const authUrl = this.googleCalendarService.generateAuthUrl();
		return { authUrl };
	}

	@Get('callback')
	@ApiOperation({ summary: 'Handle Google Calendar OAuth callback' })
	@ApiResponse({ status: 200, description: 'OAuth callback handled successfully' })
	async handleCallback(@Query('code') code: string, @Res() res: Response) {
		try {
			if (!code) {
				return res.status(400).json({ error: 'Authorization code is required' });
			}

			const tokens = await this.googleCalendarService.getTokensFromCode(code);
			
			// Aquí podrías guardar los tokens en la base de datos asociados al usuario
			// Por ahora solo los retornamos
			return res.json({
				message: 'Google Calendar connected successfully',
				tokens: {
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
					expiry_date: tokens.expiry_date,
				},
			});
		} catch (error) {
			return res.status(400).json({ error: 'Failed to process OAuth callback' });
		}
	}

	@Get('status')
	@ApiOperation({ summary: 'Check Google Calendar connection status' })
	@ApiResponse({ status: 200, description: 'Connection status retrieved successfully' })
	async getConnectionStatus(@Request() req) {
		// Aquí podrías verificar si el usuario tiene tokens guardados en la base de datos
		// Por ahora retornamos un estado básico
		return {
			connected: false,
			message: 'Google Calendar integration not configured',
		};
	}
}
