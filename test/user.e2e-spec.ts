import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Express } from 'express';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
	let app: INestApplication;
	let server: Express;
	let token: string;
	let createdUserId: number;

	interface LoginResponse {
		access_token: string;
	}

	interface UserResponse {
		id: number;
		email: string;
		firstName: string;
		lastName: string;
		phoneNumber: string;
		address: string;
		role: {
			id: number;
			roleName: string;
		};
	}

	interface PaginationResponse {
		data: UserResponse[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	}

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		server = app.getHttpServer() as Express;

		// 🔐 Login con el admin existente del seed
		const authResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'admin@mail.com',
				password: 'password123',
			})
			.expect(201);

		const { access_token } = authResponse.body as LoginResponse;
		token = access_token;
	});

	afterAll(async () => {
		await app.close();
	});

	it('/users (POST) — crear usuario nuevo', async () => {
		const response: Response = await request(server)
			.post('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({
				firstName: 'Test',
				lastName: 'E2E',
				email: 'e2e_user@mail.com',
				password: 'e2ePassword123',
				phoneNumber: '999888777',
				address: 'Calle Falsa 123',
			})
			.expect(201);

		const body = response.body as UserResponse;
		createdUserId = body.id;

		expect(body).toHaveProperty('id');
		expect(body.email).toBe('e2e_user@mail.com');
	});

	it('/users (GET) — listar todos los usuarios', async () => {
		const response: Response = await request(server)
			.get('/users?page=1&limit=10')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as PaginationResponse;
		expect(Array.isArray(body.data)).toBe(true);
		expect(body).toHaveProperty('total');
		expect(body).toHaveProperty('page');
	});

	it('/users/:id (GET) — obtener usuario por ID', async () => {
		const response: Response = await request(server)
			.get(`/users/${createdUserId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as UserResponse;
		expect(body.id).toBe(createdUserId);
		expect(body.email).toBe('e2e_user@mail.com');
	});

	it('/users/:id (PATCH) — actualizar usuario', async () => {
		const response: Response = await request(server)
			.patch(`/users/${createdUserId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				firstName: 'TestUpdated',
				address: 'Nueva dirección 456',
			})
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as UserResponse;
		expect(body.firstName).toBe('TestUpdated');
		expect(body.address).toBe('Nueva dirección 456');
	});

	it('/users/:id/role (PATCH) — asignar nuevo rol al usuario', async () => {
		await request(server)
			.patch(`/users/${createdUserId}/role`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleId: 2, // veterinario (del seed)
			})
			.expect(200);

		const userResponse: Response = await request(server)
			.get(`/users/${createdUserId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		const body = userResponse.body as UserResponse;
		expect(body.role.id).toBe(2);
		expect(body.role.roleName).toBe('veterinarian');
	});

	it('/users (POST) — crear usuario sin autenticación debe retornar 401', async () => {
		await request(server)
			.post('/users')
			.send({
				firstName: 'Test',
				lastName: 'Unauthorized',
				email: 'unauthorized@mail.com',
				password: 'password123',
				phoneNumber: '9999999999',
				address: 'Calle Falsa',
			})
			.expect(401);
	});

	it('/users (POST) — usuario sin permisos debe retornar 403', async () => {
		// Login como usuario normal (sin permisos de crear usuarios)
		const userAuthResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'user@mail.com',
				password: 'userpass456',
			})
			.expect(201);

		const userToken = (userAuthResponse.body as LoginResponse).access_token;

		await request(server)
			.post('/users')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				firstName: 'Test',
				lastName: 'Forbidden',
				email: 'forbidden@mail.com',
				password: 'password123',
				phoneNumber: '8888888888',
				address: 'Calle Falsa',
			})
			.expect(403);
	});

	it('/users (POST) — email duplicado debe retornar 409', async () => {
		// Intentar crear usuario con email duplicado
		await request(server)
			.post('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({
				firstName: 'Test',
				lastName: 'Duplicate',
				email: 'e2e_user@mail.com',
				password: 'password123',
				phoneNumber: '7777777777',
				address: 'Calle Falsa',
			})
			.expect(409);
	});

	it('/users/:id (GET) — usuario inexistente debe retornar 404', async () => {
		await request(server)
			.get('/users/99999')
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});

	it('/users/:id (PATCH) — actualizar usuario inexistente debe retornar 404', async () => {
		await request(server)
			.patch('/users/99999')
			.set('Authorization', `Bearer ${token}`)
			.send({
				firstName: 'TestUpdated',
			})
			.expect(404);
	});

	it('/users/:id/role (PATCH) — asignar rol inexistente debe retornar 404', async () => {
		await request(server)
			.patch(`/users/${createdUserId}/role`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleId: 99999, // Rol que no existe
			})
			.expect(404);
	});

	it('/users/:id (DELETE) — eliminar usuario', async () => {
		await request(server)
			.delete(`/users/${createdUserId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204);
	});

	it('/users/:id (GET) — obtener usuario eliminado debe retornar 404', async () => {
		await request(server)
			.get(`/users/${createdUserId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});
});