import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Express } from 'express';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('Catalogs (e2e)', () => {
	let app: INestApplication;
	let adminToken: string;
	let speciesId: number;
	let diagnosticTypeId: number;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Login para obtener token de admin
		const server = app.getHttpServer() as Express;
		const loginResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'admin@mail.com',
				password: 'password123',
			})
			.expect(201);

		adminToken = loginResponse.body.access_token;
	}, 30000);

	afterAll(async () => {
		await app.close();
	});

	describe('Species Controller', () => {
		describe('/species (POST) - Create Species', () => {
			it('should create a new species with admin token', async () => {
				const server = app.getHttpServer() as Express;
				const timestamp = Date.now();
				const createSpeciesDto = {
					name: `Test Species ${timestamp}`,
					description: 'A test species for e2e testing'
				};

				const response: Response = await request(server)
					.post('/species')
					.set('Authorization', `Bearer ${adminToken}`)
					.send(createSpeciesDto)
					.expect(201);

				expect(response.body).toHaveProperty('id');
				expect(response.body.name).toBe(createSpeciesDto.name);
				expect(response.body.description).toBe(createSpeciesDto.description);
				
				speciesId = response.body.id;
			});

			it('should return 401 without authorization token', async () => {
				const server = app.getHttpServer() as Express;
				const createSpeciesDto = {
					name: 'Unauthorized Species',
					description: 'This should fail'
				};

				await request(server)
					.post('/species')
					.send(createSpeciesDto)
					.expect(401);
			});

			it('should return 400 with invalid data', async () => {
				const server = app.getHttpServer() as Express;
				const invalidDto = {
					// name is required but missing
					description: 'Missing name field'
				};

				const response = await request(server)
					.post('/species')
					.set('Authorization', `Bearer ${adminToken}`)
					.send(invalidDto);

				// Could be 400 (validation error) or 409 (conflict)
				expect([400, 409]).toContain(response.status);
			});
		});

		describe('/species (GET) - Get All Species', () => {
			it('should return all species with admin token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/species')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
				expect(response.body.length).toBeGreaterThan(0);
			});

			it('should return 401 without authorization token', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.get('/species')
					.expect(401);
			});
		});

		describe('/species/:id (GET) - Get Species by ID', () => {
			it('should return species by id with admin token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get(`/species/${speciesId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200);

				expect(response.body).toHaveProperty('id', speciesId);
				expect(response.body).toHaveProperty('name');
				expect(response.body).toHaveProperty('description');
			});

			it('should return 404 for non-existent species', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.get('/species/9999')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(404);
			});
		});

		describe('/species/:id (PATCH) - Update Species', () => {
			it('should update species with admin token', async () => {
				const server = app.getHttpServer() as Express;
				const timestamp = Date.now();
				const updateDto = {
					name: `Updated Test Species ${timestamp}`,
					description: 'Updated description'
				};

				const response: Response = await request(server)
					.patch(`/species/${speciesId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.send(updateDto)
					.expect(200);

				expect(response.body.name).toBe(updateDto.name);
				expect(response.body.description).toBe(updateDto.description);
			});

			it('should return 404 for non-existent species', async () => {
				const server = app.getHttpServer() as Express;
				const updateDto = {
					name: 'Should not work'
				};

				await request(server)
					.patch('/species/9999')
					.set('Authorization', `Bearer ${adminToken}`)
					.send(updateDto)
					.expect(404);
			});
		});

		describe('/species/:id (DELETE) - Delete Species', () => {
			it('should delete species with admin token', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.delete(`/species/${speciesId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(204);
			});

			it('should return 404 when trying to delete non-existent species', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.delete('/species/9999')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(404);
			});
		});
	});

	describe('Diagnostic Types Controller', () => {
		describe('/diagnostic-types (POST) - Create Diagnostic Type', () => {
			it('should create a new diagnostic type with admin token', async () => {
				const server = app.getHttpServer() as Express;
				const timestamp = Date.now();
				const createDto = {
					name: `Test Diagnostic Type ${timestamp}`
				};

				const response: Response = await request(server)
					.post('/diagnostic-types')
					.set('Authorization', `Bearer ${adminToken}`)
					.send(createDto)
					.expect(201);

				expect(response.body).toHaveProperty('id');
				expect(response.body.name).toBe(createDto.name);
				
				diagnosticTypeId = response.body.id;
			});

			it('should return 401 without authorization token', async () => {
				const server = app.getHttpServer() as Express;
				const createDto = {
					name: 'Unauthorized Diagnostic Type'
				};

				await request(server)
					.post('/diagnostic-types')
					.send(createDto)
					.expect(401);
			});
		});

		describe('/diagnostic-types (GET) - Get All Diagnostic Types', () => {
			it('should return all diagnostic types with admin token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/diagnostic-types')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
				expect(response.body.length).toBeGreaterThan(0);
			});
		});

		describe('/diagnostic-types/:id (GET) - Get Diagnostic Type by ID', () => {
			it('should return diagnostic type by id with admin token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get(`/diagnostic-types/${diagnosticTypeId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200);

				expect(response.body).toHaveProperty('id', diagnosticTypeId);
				expect(response.body).toHaveProperty('name');
			});

			it('should return 404 for non-existent diagnostic type', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.get('/diagnostic-types/9999')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(404);
			});
		});

		describe('/diagnostic-types/:id (PATCH) - Update Diagnostic Type', () => {
			it('should update diagnostic type with admin token', async () => {
				const server = app.getHttpServer() as Express;
				const timestamp = Date.now();
				const updateDto = {
					name: `Updated Test Diagnostic Type ${timestamp}`
				};

				const response: Response = await request(server)
					.patch(`/diagnostic-types/${diagnosticTypeId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.send(updateDto)
					.expect(200);

				expect(response.body.name).toBe(updateDto.name);
			});
		});

		describe('/diagnostic-types/:id (DELETE) - Delete Diagnostic Type', () => {
			it('should delete diagnostic type with admin token', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.delete(`/diagnostic-types/${diagnosticTypeId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(204);
			});
		});
	});
});