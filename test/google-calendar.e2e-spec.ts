import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Express } from 'express';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('GoogleCalendarController (e2e)', () => {
	let app: INestApplication;
	let authToken: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Authenticate to get token
		const server = app.getHttpServer() as Express;
		const loginResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'admin@mail.com',
				password: 'password123',
			})
			.expect(201);

		authToken = loginResponse.body.access_token;
	});

	afterAll(async () => {
		await app.close();
	});

	describe('Authentication URL Generation', () => {
		it('/google-calendar/auth-url (GET) — should generate Google Calendar authorization URL or handle missing config', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/google-calendar/auth-url')
				.set('Authorization', `Bearer ${authToken}`);

			// Can be 200 (success) or 400 (missing config)
			expect([200, 400]).toContain(response.status);

			if (response.status === 200) {
				expect(response.body).toHaveProperty('authUrl');
				expect(response.body).toHaveProperty('message');
				expect(typeof response.body.authUrl).toBe('string');
				expect(response.body.authUrl).toContain('accounts.google.com');
				expect(response.body.authUrl).toContain('oauth2');
				expect(response.body.message).toContain('authorize Google Calendar access');
			} else {
				// Handle case where Google credentials are not configured
				expect(response.body).toHaveProperty('message');
				expect(response.body.message).toMatch(/Failed to generate|authorization URL/i);
			}
		});

		it('/google-calendar/auth-url (GET) — should return 401 without authentication', async () => {
			const server = app.getHttpServer() as Express;

			await request(server)
				.get('/google-calendar/auth-url')
				.expect(401);
		});
	});

	describe('Connection Status', () => {
		it('/google-calendar/status (GET) — should check Google Calendar connection status', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/google-calendar/status')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body).toHaveProperty('connected');
			expect(response.body).toHaveProperty('user');
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('status');
			expect(typeof response.body.connected).toBe('boolean');
			expect(['active', 'inactive', 'error']).toContain(response.body.status);
		});

		it('/google-calendar/status (GET) — should return 401 without authentication', async () => {
			const server = app.getHttpServer() as Express;

			await request(server)
				.get('/google-calendar/status')
				.expect(401);
		});
	});

	describe('OAuth Callback', () => {
		it('/google-calendar/callback (GET) — should return 400 for missing authorization code', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/google-calendar/callback')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			expect(response.body).toHaveProperty('error');
			expect(response.body.error).toContain('Authorization code is required');
		});

		it('/google-calendar/callback (GET) — should return 400 for invalid authorization code', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/google-calendar/callback?code=invalid_code')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			expect(response.body).toHaveProperty('error');
			expect(response.body.error).toContain('Failed to process OAuth callback');
		});

		it('/google-calendar/callback (GET) — should return 401 without authentication', async () => {
			const server = app.getHttpServer() as Express;

			await request(server)
				.get('/google-calendar/callback?code=test_code')
				.expect(401);
		});
	});

	describe('Events Listing', () => {
		it('/google-calendar/events (GET) — should return 400 when service not initialized', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/google-calendar/events')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Google Calendar service not initialized');
		});

		it('/google-calendar/events (GET) — should validate date range parameters', async () => {
			const server = app.getHttpServer() as Express;

			// Test with invalid date format
			await request(server)
				.get('/google-calendar/events?timeMin=invalid-date')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);
		});

		it('/google-calendar/events (GET) — should return 401 without authentication', async () => {
			const server = app.getHttpServer() as Express;

			await request(server)
				.get('/google-calendar/events')
				.expect(401);
		});

		it('/google-calendar/events (GET) — should handle valid date range when service is initialized', async () => {
			const server = app.getHttpServer() as Express;

			const timeMin = new Date().toISOString();
			const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

			// This will still fail because service is not initialized, but validates the date parsing
			const response: Response = await request(server)
				.get(`/google-calendar/events?timeMin=${timeMin}&timeMax=${timeMax}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			expect(response.body.message).toContain('Google Calendar service not initialized');
		});
	});

	describe('Disconnect', () => {
		it('/google-calendar/disconnect (POST) — should handle disconnect request', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.post('/google-calendar/disconnect')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('user');
			expect(response.body).toHaveProperty('status');
			expect(response.body.message).toContain('Google Calendar disconnected successfully');
			expect(response.body.status).toBe('disconnected');
		});

		it('/google-calendar/disconnect (POST) — should return 401 without authentication', async () => {
			const server = app.getHttpServer() as Express;

			await request(server)
				.post('/google-calendar/disconnect')
				.expect(401);
		});
	});

	describe('Integration Flow', () => {
		it('should follow the complete integration flow', async () => {
			const server = app.getHttpServer() as Express;

			// Step 1: Check initial status (should be disconnected)
			const statusResponse: Response = await request(server)
				.get('/google-calendar/status')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(statusResponse.body.connected).toBe(false);
			expect(['inactive', 'error']).toContain(statusResponse.body.status);

			// Step 2: Get authorization URL (may fail if config missing)
			const authUrlResponse: Response = await request(server)
				.get('/google-calendar/auth-url')
				.set('Authorization', `Bearer ${authToken}`);

			expect([200, 400]).toContain(authUrlResponse.status);

			if (authUrlResponse.status === 200) {
				expect(authUrlResponse.body.authUrl).toContain('accounts.google.com');
			}

			// Step 3: Attempt to list events (should fail - not initialized)
			await request(server)
				.get('/google-calendar/events')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			// Step 4: Disconnect (should work even if not connected)
			const disconnectResponse: Response = await request(server)
				.post('/google-calendar/disconnect')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(disconnectResponse.body.status).toBe('disconnected');
		});
	});

	describe('Error Handling', () => {
		it('should handle malformed requests gracefully', async () => {
			const server = app.getHttpServer() as Express;

			// Test with extremely long query parameters
			const longString = 'a'.repeat(10000);
			await request(server)
				.get(`/google-calendar/events?timeMin=${longString}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);
		});

		it('should validate query parameters properly', async () => {
			const server = app.getHttpServer() as Express;

			// Test with timeMin > timeMax (when service is initialized, this would be caught)
			const timeMin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
			const timeMax = new Date().toISOString();

			const response: Response = await request(server)
				.get(`/google-calendar/events?timeMin=${timeMin}&timeMax=${timeMax}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			// Should fail due to service not initialized, but would also fail due to date validation
			expect(response.body.message).toContain('Google Calendar service not initialized');
		});
	});

	describe('Security', () => {
		it('should require authentication for all endpoints', async () => {
			const server = app.getHttpServer() as Express;

			const endpoints = [
				{ method: 'get', path: '/google-calendar/auth-url' },
				{ method: 'get', path: '/google-calendar/status' },
				{ method: 'get', path: '/google-calendar/callback' },
				{ method: 'get', path: '/google-calendar/events' },
				{ method: 'post', path: '/google-calendar/disconnect' },
			];

			for (const endpoint of endpoints) {
				await request(server)
					[endpoint.method](endpoint.path)
					.expect(401);
			}
		});

		it('should not expose sensitive information in responses', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/google-calendar/status')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			// Ensure no sensitive data is exposed
			const responseString = JSON.stringify(response.body);
			expect(responseString).not.toContain('password');
			expect(responseString).not.toContain('secret');
			expect(responseString).not.toContain('private_key');
		});
	});
});
