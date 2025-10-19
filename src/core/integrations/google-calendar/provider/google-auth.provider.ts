import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';
import { GoogleAuthTokens, GoogleCalendarConfig } from '../interfaces/google-calendar.interface';

@Injectable()
export class GoogleAuthProvider {
	private readonly logger = new Logger(GoogleAuthProvider.name);
	private oauth2Client: Auth.OAuth2Client;
	private readonly config: GoogleCalendarConfig;

	constructor(private configService: ConfigService) {
		this.config = {
			clientId: this.configService.get<string>('GOOGLE_CLIENT_ID') || '',
			clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
			redirectUri: this.configService.get<string>('GOOGLE_REDIRECT_URI') || '',
			scopes: [
				'https://www.googleapis.com/auth/calendar',
				'https://www.googleapis.com/auth/calendar.events',
			],
		};

		this.oauth2Client = new google.auth.OAuth2(
			this.config.clientId,
			this.config.clientSecret,
			this.config.redirectUri,
		);
	}

	/**
	 * Genera la URL de autorización para Google OAuth2
	 */
	generateAuthUrl(): string {
		return this.oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: this.config.scopes,
			prompt: 'consent',
		});
	}

	/**
	 * Intercambia el código de autorización por tokens de acceso
	 */
	async getTokensFromCode(code: string): Promise<GoogleAuthTokens> {
		try {
			const { tokens } = await this.oauth2Client.getToken(code);
			return tokens as GoogleAuthTokens;
		} catch (error) {
			this.logger.error('Error getting tokens from code:', error);
			throw new Error('Failed to get tokens from authorization code');
		}
	}

	/**
	 * Configura las credenciales del cliente OAuth2
	 */
	setCredentials(tokens: GoogleAuthTokens): void {
		this.oauth2Client.setCredentials(tokens);
	}

	/**
	 * Refresca el token de acceso si es necesario
	 */
	async refreshAccessToken(): Promise<GoogleAuthTokens> {
		try {
			const { credentials } = await this.oauth2Client.refreshAccessToken();
			this.oauth2Client.setCredentials(credentials);
			return credentials as GoogleAuthTokens;
		} catch (error) {
			this.logger.error('Error refreshing access token:', error);
			throw new Error('Failed to refresh access token');
		}
	}

	/**
	 * Obtiene el cliente OAuth2 configurado
	 */
	getOAuth2Client(): Auth.OAuth2Client {
		return this.oauth2Client;
	}

	/**
	 * Verifica si el token de acceso es válido
	 */
	async isTokenValid(): Promise<boolean> {
		try {
			await this.oauth2Client.getAccessToken();
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Revoca el token de acceso
	 */
	async revokeToken(): Promise<void> {
		try {
			await this.oauth2Client.revokeCredentials();
		} catch (error) {
			this.logger.error('Error revoking token:', error);
			throw new Error('Failed to revoke token');
		}
	}
}
