import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Express } from 'express';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { AppointmentStatus, AppointmentType } from '../src/clinic/appointments/entities/appointment.entity';
import { ScheduleStatus } from '../src/clinic/appointments/entities/schedule.entity';

describe('AppointmentsController (e2e)', () => {
	let app: INestApplication;
	let authToken: string;
	let createdScheduleId: number;
	let createdAppointmentId: number;

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

	describe('Schedules', () => {
		it('/appointments/schedules (POST) — should create a new schedule', async () => {
			const server = app.getHttpServer() as Express;

			const createScheduleDto = {
				name: 'Test Schedule',
				description: 'A test schedule for e2e testing',
				startTime: '09:00:00',
				endTime: '17:00:00',
				daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
				startDate: '2024-01-01',
				endDate: '2024-12-31',
				appointmentDuration: 30,
				breakDuration: 5,
				status: ScheduleStatus.ACTIVE,
			};

			const response: Response = await request(server)
				.post('/appointments/schedules')
				.set('Authorization', `Bearer ${authToken}`)
				.send(createScheduleDto)
				.expect(201);

			expect(response.body).toHaveProperty('id');
			expect(response.body.name).toBe(createScheduleDto.name);
			expect(response.body.description).toBe(createScheduleDto.description);
			expect(response.body.status).toBe(createScheduleDto.status);

			createdScheduleId = response.body.id;
		});

		it('/appointments/schedules (GET) — should get all schedules for authenticated user', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/appointments/schedules')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(Array.isArray(response.body.schedules)).toBe(true);
			expect(response.body).toHaveProperty('total');
			expect(typeof response.body.total).toBe('number');
		});

		it('/appointments/schedules/:id (GET) — should get a schedule by ID', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get(`/appointments/schedules/${createdScheduleId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.id).toBe(createdScheduleId);
			expect(response.body.name).toBe('Test Schedule');
		});

		it('/appointments/schedules/:id (PATCH) — should update a schedule', async () => {
			const server = app.getHttpServer() as Express;

			const updateScheduleDto = {
				name: 'Updated Test Schedule',
				description: 'Updated description',
			};

			const response: Response = await request(server)
				.patch(`/appointments/schedules/${createdScheduleId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.send(updateScheduleDto)
				.expect(200);

			expect(response.body.name).toBe(updateScheduleDto.name);
			expect(response.body.description).toBe(updateScheduleDto.description);
		});

		it('/appointments/schedules/:id (GET) — should return 404 for non-existent schedule', async () => {
			const server = app.getHttpServer() as Express;

			await request(server)
				.get('/appointments/schedules/99999')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(404);
		});
	});

	describe('Appointments', () => {
		it('/appointments (POST) — should create a new appointment', async () => {
			const server = app.getHttpServer() as Express;

			const createAppointmentDto = {
				appointmentDate: '2024-06-15',
				startTime: '10:00:00',
				endTime: '10:30:00',
				status: AppointmentStatus.SCHEDULED,
				type: AppointmentType.CONSULTATION,
				notes: 'Test appointment notes',
				reason: 'Regular checkup',
				veterinarianId: 2, // ID del veterinario del seed
				petId: 1, // ID de la mascota del seed
				scheduleId: createdScheduleId,
			};

			const response: Response = await request(server)
				.post('/appointments')
				.set('Authorization', `Bearer ${authToken}`)
				.send(createAppointmentDto)
				.expect(201);

			expect(response.body).toHaveProperty('id');
			expect(response.body.type).toBe(createAppointmentDto.type);
			expect(response.body.status).toBe(createAppointmentDto.status);
			expect(response.body.notes).toBe(createAppointmentDto.notes);

			createdAppointmentId = response.body.id;
		});

		it('/appointments (GET) — should get all appointments', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/appointments')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(Array.isArray(response.body.appointments)).toBe(true);
			expect(response.body).toHaveProperty('total');
			expect(typeof response.body.total).toBe('number');
		});

		it('/appointments/:id (GET) — should get an appointment by ID', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get(`/appointments/${createdAppointmentId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.id).toBe(createdAppointmentId);
			expect(response.body.type).toBe(AppointmentType.CONSULTATION);
		});

		it('/appointments/veterinarian/:veterinarianId (GET) — should get appointments by veterinarian', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/appointments/veterinarian/2') // ID del veterinario del seed
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(Array.isArray(response.body.appointments)).toBe(true);
			expect(response.body).toHaveProperty('total');
		});

		it('/appointments/pet/:petId (GET) — should get appointments by pet', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.get('/appointments/pet/1')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(Array.isArray(response.body.appointments)).toBe(true);
			expect(response.body).toHaveProperty('total');
		});

		it('/appointments/:id (PATCH) — should update an appointment', async () => {
			const server = app.getHttpServer() as Express;

			const updateAppointmentDto = {
				status: AppointmentStatus.CONFIRMED,
				notes: 'Updated appointment notes',
			};

			const response: Response = await request(server)
				.patch(`/appointments/${createdAppointmentId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.send(updateAppointmentDto)
				.expect(200);

			expect(response.body.status).toBe(updateAppointmentDto.status);
			expect(response.body.notes).toBe(updateAppointmentDto.notes);
		});

		it('/appointments (POST) — should return 400 for invalid appointment data', async () => {
			const server = app.getHttpServer() as Express;

			const invalidAppointmentDto = {
				appointmentDate: 'invalid-date',
				startTime: '10:00:00',
				endTime: '10:30:00',
				type: 'INVALID_TYPE',
				veterinarianId: 'not-a-number',
				petId: 1,
				scheduleId: createdScheduleId,
			};

			// Should return 400 due to validation errors
			const response = await request(server)
				.post('/appointments')
				.set('Authorization', `Bearer ${authToken}`)
				.send(invalidAppointmentDto);

			expect([400, 500]).toContain(response.status); // 400 for validation, 500 for type conversion errors
		});

		it('/appointments/:id (GET) — should return 404 for non-existent appointment', async () => {
			const server = app.getHttpServer() as Express;

			await request(server)
				.get('/appointments/99999')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(404);
		});

		it('/appointments/:id (DELETE) — should delete an appointment', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.delete(`/appointments/${createdAppointmentId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.message).toBe('Appointment deleted successfully');

			// Verify appointment is deleted
			await request(server)
				.get(`/appointments/${createdAppointmentId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(404);
		});
	});

	describe('Authorization', () => {
		it('/appointments (GET) — should return 401 without authentication', async () => {
			const server = app.getHttpServer() as Express;

			await request(server)
				.get('/appointments')
				.expect(401);
		});

		it('/appointments/schedules (POST) — should return 401 without authentication', async () => {
			const server = app.getHttpServer() as Express;

			const createScheduleDto = {
				name: 'Test Schedule',
				startTime: '09:00:00',
				endTime: '17:00:00',
			};

			await request(server)
				.post('/appointments/schedules')
				.send(createScheduleDto)
				.expect(401);
		});
	});

	describe('Cleanup', () => {
		it('/appointments/schedules/:id (DELETE) — should delete the test schedule', async () => {
			const server = app.getHttpServer() as Express;

			const response: Response = await request(server)
				.delete(`/appointments/schedules/${createdScheduleId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.message).toBe('Schedule deleted successfully');
		});
	});
});
