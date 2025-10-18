import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Express } from 'express';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('Clinic (e2e)', () => {
	let app: INestApplication;
	let adminToken: string;
	let veterinarianToken: string;
	let ownerToken: string;
	let petId: number;
	let medicalRecordId: number;
	let diagnosticId: number;
	let speciesId: number;
	let diagnosticTypeId: number;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		const server = app.getHttpServer() as Express;

		// Login como admin
		const adminResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'admin@mail.com',
				password: 'password123',
			})
			.expect(201);
		adminToken = adminResponse.body.access_token;

		// Login como veterinario
		const vetResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'veterinario@mail.com',
				password: 'vetpass123',
			})
			.expect(201);
		veterinarianToken = vetResponse.body.access_token;

		// Login como owner
		const ownerResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'carlos.perez@mail.com',
				password: 'owner123',
			})
			.expect(201);
		ownerToken = ownerResponse.body.access_token;

		// Crear species para usar en las pruebas
		const timestamp = Date.now();
		const speciesResponse: Response = await request(server)
			.post('/species')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				name: `Test Dog ${timestamp}`,
				description: 'Test species for e2e'
			});
		speciesId = speciesResponse.body.id;

		// Crear diagnostic type para usar en las pruebas
		const diagnosticTypeResponse: Response = await request(server)
			.post('/diagnostic-types')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				name: `Test Consultation ${timestamp}`
			});
		diagnosticTypeId = diagnosticTypeResponse.body.id;
	}, 30000);

	afterAll(async () => {
		await app.close();
	});

	describe('Pets Controller', () => {
		describe('/pets (POST) - Create Pet', () => {
			it('should create a new pet with admin token', async () => {
				const server = app.getHttpServer() as Express;
				const timestamp = Date.now();
				const createPetDto = {
					name: `Test Pet ${timestamp}`,
					gender: 'male',
					breed: 'Mixed',
					birthDate: '2021-01-15',
					color: 'Brown',
					speciesId: speciesId,
					ownerId: 4 // Carlos Perez ID
				};

				const response: Response = await request(server)
					.post('/pets')
					.set('Authorization', `Bearer ${adminToken}`)
					.send(createPetDto)
					.expect(201);

				expect(response.body).toHaveProperty('id');
				expect(response.body.name).toBe(createPetDto.name);
				expect(response.body.gender).toBe(createPetDto.gender);
				
				petId = response.body.id;
			});

			it('should return 401 without authorization token', async () => {
				const server = app.getHttpServer() as Express;
				const createPetDto = {
					name: 'Unauthorized Pet',
					gender: 'female',
					breed: 'Mixed',
					birthDate: '2021-01-15',
					speciesId: speciesId,
					ownerId: 4
				};

				await request(server)
					.post('/pets')
					.send(createPetDto)
					.expect(401);
			});

			it('should return 403 with veterinarian token (no pet_create permission)', async () => {
				const server = app.getHttpServer() as Express;
				const createPetDto = {
					name: 'Vet Pet',
					age: 1,
					gender: 'MALE',
					speciesId: speciesId,
					ownerId: 4
				};

				await request(server)
					.post('/pets')
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.send(createPetDto)
					.expect(403);
			});
		});

		describe('/pets (GET) - Get All Pets', () => {
			it('should return all pets with admin token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/pets')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
				expect(response.body.length).toBeGreaterThan(0);
			});

			it('should return pets with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/pets')
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
			});

			it('should return pets with owner token (has pet_read permission)', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/pets')
					.set('Authorization', `Bearer ${ownerToken}`)
					.expect(200);
				
				expect(Array.isArray(response.body)).toBe(true);
			});
		});

		describe('/pets/:id (GET) - Get Pet by ID', () => {
			it('should return pet by id with admin token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get(`/pets/${petId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200);

				expect(response.body).toHaveProperty('id', petId);
				expect(response.body).toHaveProperty('name');
			});

			it('should return 404 for non-existent pet', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.get('/pets/9999')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(404);
			});
		});

		describe('/pets/owner/:ownerId (GET) - Get Pets by Owner', () => {
			it('should return pets for specific owner with admin token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/pets/owner/4')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
			});

			it('should return pets for specific owner with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/pets/owner/4')
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
			});
		});

		describe('/pets/:id (PATCH) - Update Pet', () => {
			it('should update pet with admin token', async () => {
				const server = app.getHttpServer() as Express;
				const updateDto = {
					name: 'Updated Test Pet',
					color: 'Updated Brown'
				};

				const response: Response = await request(server)
					.patch(`/pets/${petId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.send(updateDto)
					.expect(200);

				expect(response.body.name).toBe(updateDto.name);
				expect(response.body.color).toBe(updateDto.color);
			});

			it('should update pet with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;
				const updateDto = {
					color: 'Updated color'
				};

				const response: Response = await request(server)
					.patch(`/pets/${petId}`)
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.send(updateDto)
					.expect(200);

				expect(response.body.color).toBe(updateDto.color);
			});
		});

		describe('/pets/:id (DELETE) - Delete Pet', () => {
			it('should delete pet with admin token', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.delete(`/pets/${petId}`)
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(204);
			});
		});
	});

	describe('Medical Records Controller', () => {
		beforeAll(async () => {
			// Recrear pet para medical records tests
			const server = app.getHttpServer() as Express;
			const petResponse: Response = await request(server)
				.post('/pets')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					name: 'Medical Test Pet',
					gender: 'female',
					breed: 'Mixed',
					birthDate: '2021-01-15',
					speciesId: speciesId,
					ownerId: 4
				});
			petId = petResponse.body.id;
		});

		describe('/medical-records (POST) - Create Medical Record', () => {
			it('should create a new medical record with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;
				const createDto = {
					openingDate: '2024-01-15',
					weight: 25.5,
					size: 'medium',
					allergies: 'None known',
					medications: 'None',
					vaccinationStatus: 'Up to date',
					petId: petId,
					veterinarianId: 2
				};

				const response: Response = await request(server)
					.post('/medical-records')
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.send(createDto)
					.expect(201);

				expect(response.body).toHaveProperty('id');
				expect(response.body.weight).toBe(createDto.weight);
				expect(response.body.size).toBe(createDto.size);
				
				medicalRecordId = response.body.id;
			});

			it('should return 403 with admin token (no medical_record_create permission)', async () => {
				const server = app.getHttpServer() as Express;
				const createDto = {
					openingDate: '2024-01-15',
					petId: petId,
					veterinarianId: 2
				};

				await request(server)
					.post('/medical-records')
					.set('Authorization', `Bearer ${adminToken}`)
					.send(createDto)
					.expect(403);
			});
		});

		describe('/medical-records (GET) - Get All Medical Records', () => {
			it('should return all medical records with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/medical-records')
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
			});

			it('should return 403 with admin token', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.get('/medical-records')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(403);
			});
		});

		describe('/medical-records/:id (GET) - Get Medical Record by ID', () => {
			it('should return medical record by id with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get(`/medical-records/${medicalRecordId}`)
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(200);

				expect(response.body).toHaveProperty('id', medicalRecordId);
			});
		});

		describe('/medical-records/:id (PATCH) - Update Medical Record', () => {
			it('should update medical record with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;
				const updateDto = {
					weight: 26.0,
					allergies: 'Updated allergies'
				};

				const response: Response = await request(server)
					.patch(`/medical-records/${medicalRecordId}`)
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.send(updateDto)
					.expect(200);

				expect(parseFloat(response.body.weight)).toBe(updateDto.weight);
				expect(response.body.allergies).toBe(updateDto.allergies);
			});
		});

		describe('/medical-records/:id (DELETE) - Delete Medical Record', () => {
			it('should delete medical record with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.delete(`/medical-records/${medicalRecordId}`)
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(204);
			});
		});
	});

	describe('Diagnostics Controller', () => {
		beforeAll(async () => {
			// Recrear medical record para diagnostics tests
			const server = app.getHttpServer() as Express;
			const recordResponse: Response = await request(server)
				.post('/medical-records')
				.set('Authorization', `Bearer ${veterinarianToken}`)
				.send({
					openingDate: '2024-01-15',
					weight: 25.5,
					petId: petId,
					veterinarianId: 2
				});
			medicalRecordId = recordResponse.body.id;
		});

		describe('/diagnostics (POST) - Create Diagnostic', () => {
			it('should create a new diagnostic with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;
				const createDto = {
					visitDate: '2024-01-15',
					reason: 'Regular checkup',
					symptoms: 'No symptoms observed',
					examination: 'Normal examination',
					severity: 'low',
					recommendations: 'Continue current care',
					diagnosticTypeId: diagnosticTypeId,
					medicalRecordId: medicalRecordId,
					veterinarianId: 2
				};

				const response: Response = await request(server)
					.post('/diagnostics')
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.send(createDto)
					.expect(201);

				expect(response.body).toHaveProperty('id');
				expect(response.body.reason).toBe(createDto.reason);
				expect(response.body.severity).toBe(createDto.severity);
				
				diagnosticId = response.body.id;
			});

			it('should return 403 with admin token (no diagnostic_create permission)', async () => {
				const server = app.getHttpServer() as Express;
				const createDto = {
					visitDate: '2024-01-15',
					reason: 'Admin diagnostic',
					severity: 'low',
					medicalRecordId: medicalRecordId,
					diagnosticTypeId: diagnosticTypeId
				};

				await request(server)
					.post('/diagnostics')
					.set('Authorization', `Bearer ${adminToken}`)
					.send(createDto)
					.expect(403);
			});
		});

		describe('/diagnostics (GET) - Get All Diagnostics', () => {
			it('should return all diagnostics with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get('/diagnostics')
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
			});

			it('should return 403 with admin token', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.get('/diagnostics')
					.set('Authorization', `Bearer ${adminToken}`)
					.expect(403);
			});
		});

		describe('/diagnostics/:id (GET) - Get Diagnostic by ID', () => {
			it('should return diagnostic by id with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get(`/diagnostics/${diagnosticId}`)
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(200);

				expect(response.body).toHaveProperty('id', diagnosticId);
			});
		});

		describe('/diagnostics/by-pet/:petId (GET) - Get Diagnostics by Pet', () => {
			it('should return diagnostics for specific pet with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				const response: Response = await request(server)
					.get(`/diagnostics/by-pet/${petId}`)
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(200);

				expect(Array.isArray(response.body)).toBe(true);
			});
		});

		describe('/diagnostics/:id (PATCH) - Update Diagnostic', () => {
			it('should update diagnostic with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;
				const updateDto = {
					reason: 'Updated diagnostic reason',
					severity: 'moderate',
					recommendations: 'Updated recommendations'
				};

				const response: Response = await request(server)
					.patch(`/diagnostics/${diagnosticId}`)
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.send(updateDto)
					.expect(200);

				expect(response.body.reason).toBe(updateDto.reason);
				expect(response.body.severity).toBe(updateDto.severity);
				expect(response.body.recommendations).toBe(updateDto.recommendations);
			});
		});

		describe('/diagnostics/:id (DELETE) - Delete Diagnostic', () => {
			it('should delete diagnostic with veterinarian token', async () => {
				const server = app.getHttpServer() as Express;

				await request(server)
					.delete(`/diagnostics/${diagnosticId}`)
					.set('Authorization', `Bearer ${veterinarianToken}`)
					.expect(204);
			});
		});
	});
});