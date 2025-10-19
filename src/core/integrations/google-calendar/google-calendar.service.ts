import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { calendar_v3, google } from 'googleapis';
import { AppointmentCalendarEvent, GoogleCalendarEvent, GoogleCalendarEventResponse } from './interfaces/google-calendar.interface';
import { GoogleAuthProvider } from './provider/google-auth.provider';

@Injectable()
export class GoogleCalendarService {
	private readonly logger = new Logger(GoogleCalendarService.name);
	private calendar: calendar_v3.Calendar;

	constructor(private googleAuthProvider: GoogleAuthProvider) {}

	/**
	 * Inicializa el servicio con tokens de autenticación
	 */
	async initialize(tokens: any): Promise<void> {
		this.googleAuthProvider.setCredentials(tokens);
		this.calendar = google.calendar({ version: 'v3', auth: this.googleAuthProvider.getOAuth2Client() });
	}

	/**
	 * Crea un evento en Google Calendar
	 */
	async createEvent(event: GoogleCalendarEvent): Promise<GoogleCalendarEventResponse> {
		try {
			if (!this.calendar) {
				throw new BadRequestException('Google Calendar service not initialized');
			}

			const response = await this.calendar.events.insert({
				calendarId: 'primary',
				requestBody: event,
			});

			this.logger.log(`Event created with ID: ${response.data.id}`);
			return response.data as GoogleCalendarEventResponse;
		} catch (error) {
			this.logger.error('Error creating calendar event:', error);
			throw new Error('Failed to create calendar event');
		}
	}

	/**
	 * Actualiza un evento existente en Google Calendar
	 */
	async updateEvent(eventId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEventResponse> {
		try {
			if (!this.calendar) {
				throw new BadRequestException('Google Calendar service not initialized');
			}

			const response = await this.calendar.events.update({
				calendarId: 'primary',
				eventId: eventId,
				requestBody: event,
			});

			this.logger.log(`Event updated with ID: ${eventId}`);
			return response.data as GoogleCalendarEventResponse;
		} catch (error) {
			this.logger.error('Error updating calendar event:', error);
			throw new Error('Failed to update calendar event');
		}
	}

	/**
	 * Elimina un evento de Google Calendar
	 */
	async deleteEvent(eventId: string): Promise<void> {
		try {
			if (!this.calendar) {
				throw new BadRequestException('Google Calendar service not initialized');
			}

			await this.calendar.events.delete({
				calendarId: 'primary',
				eventId: eventId,
			});

			this.logger.log(`Event deleted with ID: ${eventId}`);
		} catch (error) {
			this.logger.error('Error deleting calendar event:', error);
			throw new Error('Failed to delete calendar event');
		}
	}

	/**
	 * Obtiene un evento específico de Google Calendar
	 */
	async getEvent(eventId: string): Promise<GoogleCalendarEventResponse> {
		try {
			if (!this.calendar) {
				throw new BadRequestException('Google Calendar service not initialized');
			}

			const response = await this.calendar.events.get({
				calendarId: 'primary',
				eventId: eventId,
			});

			return response.data as GoogleCalendarEventResponse;
		} catch (error) {
			this.logger.error('Error getting calendar event:', error);
			throw new NotFoundException('Calendar event not found');
		}
	}

	/**
	 * Lista eventos de Google Calendar en un rango de fechas
	 */
	async listEvents(timeMin: Date, timeMax: Date): Promise<GoogleCalendarEventResponse[]> {
		try {
			if (!this.calendar) {
				throw new BadRequestException('Google Calendar service not initialized');
			}

			const response = await this.calendar.events.list({
				calendarId: 'primary',
				timeMin: timeMin.toISOString(),
				timeMax: timeMax.toISOString(),
				singleEvents: true,
				orderBy: 'startTime',
			});

			return response.data.items as GoogleCalendarEventResponse[];
		} catch (error) {
			this.logger.error('Error listing calendar events:', error);
			throw new Error('Failed to list calendar events');
		}
	}

	/**
	 * Convierte un appointment del sistema a un evento de Google Calendar
	 */
	convertAppointmentToCalendarEvent(appointmentEvent: AppointmentCalendarEvent): GoogleCalendarEvent {
		return {
			summary: appointmentEvent.title,
			description: appointmentEvent.description,
			start: {
				dateTime: appointmentEvent.startDateTime.toISOString(),
				timeZone: 'America/Mexico_City', // Puedes hacer esto configurable
			},
			end: {
				dateTime: appointmentEvent.endDateTime.toISOString(),
				timeZone: 'America/Mexico_City',
			},
			attendees: [
				{
					email: appointmentEvent.veterinarianEmail,
					responseStatus: 'accepted',
				},
				...(appointmentEvent.petOwnerEmail ? [{
					email: appointmentEvent.petOwnerEmail,
					responseStatus: 'needsAction' as const,
				}] : []),
			],
			location: appointmentEvent.location,
			reminders: {
				useDefault: false,
				overrides: [
					{ method: 'email', minutes: 24 * 60 }, // 1 día antes
					{ method: 'popup', minutes: 30 }, // 30 minutos antes
				],
			},
		};
	}

	/**
	 * Sincroniza un appointment con Google Calendar
	 */
	async syncAppointmentWithCalendar(
		appointmentEvent: AppointmentCalendarEvent,
		googleEventId?: string,
	): Promise<GoogleCalendarEventResponse> {
		const calendarEvent = this.convertAppointmentToCalendarEvent(appointmentEvent);

		if (googleEventId) {
			return await this.updateEvent(googleEventId, calendarEvent);
		} else {
			return await this.createEvent(calendarEvent);
		}
	}

	/**
	 * Genera la URL de autorización para Google OAuth2
	 */
	generateAuthUrl(): string {
		return this.googleAuthProvider.generateAuthUrl();
	}

	/**
	 * Obtiene tokens de acceso desde un código de autorización
	 */
	async getTokensFromCode(code: string): Promise<any> {
		return await this.googleAuthProvider.getTokensFromCode(code);
	}

	/**
	 * Verifica si el servicio está inicializado
	 */
	isInitialized(): boolean {
		return !!this.calendar;
	}
}

