import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Express } from 'express';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

interface LoginResponse {
  access_token: string;
}

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/auth/login (POST) — credenciales válidas', async () => {
		const server = app.getHttpServer() as Express;

		const response: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'admin@mail.com',
				password: 'password123',
			})
			.expect(201);

		const { access_token } = response.body as LoginResponse;

		expect(access_token).toBeDefined();
		expect(typeof access_token).toBe('string');
	});

	it('/auth/login (POST) — credenciales incorrectas', async () => {
		const server = app.getHttpServer() as Express;

		const response: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'admin@mail.com',
				password: 'wrongpassword',
			})
			.expect(401);

		expect(response.body).toBeDefined();
	});
});
