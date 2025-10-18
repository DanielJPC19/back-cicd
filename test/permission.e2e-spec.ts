import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Express } from 'express';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('PermissionsController (e2e)', () => {
	let app: INestApplication;
	let server: Express;
	let token: string;
	let createdPermissionId: number;

	interface LoginResponse {
		access_token: string;
	}

	interface PermissionResponse {
		id: number;
		permissionName: string;
		createdAt: string;
		updatedAt: string;
	}

	interface PaginationResponse {
		data: PermissionResponse[];
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

	it('/permissions (POST) — crear permiso nuevo', async () => {
		const response: Response = await request(server)
			.post('/permissions')
			.set('Authorization', `Bearer ${token}`)
			.send({
				permissionName: 'test_permission_e2e',
			})
			.expect(201);

		const body = response.body as PermissionResponse;
		createdPermissionId = body.id;

		expect(body).toHaveProperty('id');
		expect(body.permissionName).toBe('test_permission_e2e');
	});

	it('/permissions (GET) — listar todos los permisos', async () => {
		const response: Response = await request(server)
			.get('/permissions?page=1&limit=10')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as PaginationResponse;
		expect(Array.isArray(body.data)).toBe(true);
		expect(body).toHaveProperty('total');
		expect(body).toHaveProperty('page');
		expect(body).toHaveProperty('limit');
	});

	it('/permissions/:id (GET) — obtener permiso por ID', async () => {
		const response: Response = await request(server)
			.get(`/permissions/${createdPermissionId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as PermissionResponse;
		expect(body.id).toBe(createdPermissionId);
		expect(body.permissionName).toBe('test_permission_e2e');
	});

	it('/permissions/:id (PATCH) — actualizar permiso', async () => {
		const response: Response = await request(server)
			.patch(`/permissions/${createdPermissionId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				permissionName: 'test_permission_e2e_updated',
			})
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as PermissionResponse;
		expect(body.permissionName).toBe('test_permission_e2e_updated');
	});

	it('/permissions (POST) — crear permiso sin autenticación debe retornar 401', async () => {
		await request(server)
			.post('/permissions')
			.send({
				permissionName: 'unauthorized_permission',
			})
			.expect(401);
	});

	it('/permissions (POST) — usuario sin permisos debe retornar 403', async () => {
		// Login como usuario normal (sin permisos de crear permisos)
		const userAuthResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'user@mail.com',
				password: 'userpass456',
			})
			.expect(201);

		const userToken = (userAuthResponse.body as LoginResponse).access_token;

		await request(server)
			.post('/permissions')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				permissionName: 'forbidden_permission',
			})
			.expect(403);
	});

	it('/permissions (POST) — permiso duplicado debe retornar 409', async () => {
		// Crear primer permiso
		await request(server)
			.post('/permissions')
			.set('Authorization', `Bearer ${token}`)
			.send({
				permissionName: 'duplicate_test_permission',
			})
			.expect(201);

		// Intentar crear otro con el mismo nombre
		await request(server)
			.post('/permissions')
			.set('Authorization', `Bearer ${token}`)
			.send({
				permissionName: 'duplicate_test_permission',
			})
			.expect(409);
	});

	it('/permissions/:id (PATCH) — permiso duplicado al actualizar debe retornar 409', async () => {
		// Crear un segundo permiso para tener dos
		const secondPermissionResponse: Response = await request(server)
			.post('/permissions')
			.set('Authorization', `Bearer ${token}`)
			.send({
				permissionName: 'second_test_permission',
			})
			.expect(201);

		const secondPermissionId = (secondPermissionResponse.body as PermissionResponse).id;

		// Intentar actualizar el primer permiso con el nombre del segundo
		await request(server)
			.patch(`/permissions/${createdPermissionId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				permissionName: 'second_test_permission', // Nombre del otro permiso
			})
			.expect(409);

		// Limpiar: eliminar el segundo permiso
		await request(server)
			.delete(`/permissions/${secondPermissionId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204);
	});

	it('/permissions/:id (GET) — permiso inexistente debe retornar 404', async () => {
		await request(server)
			.get('/permissions/99999')
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});

	it('/permissions/:id (PATCH) — actualizar permiso inexistente debe retornar 404', async () => {
		await request(server)
			.patch('/permissions/99999')
			.set('Authorization', `Bearer ${token}`)
			.send({
				permissionName: 'new_name',
			})
			.expect(404);
	});

	it('/permissions/:id (DELETE) — eliminar permiso', async () => {
		await request(server)
			.delete(`/permissions/${createdPermissionId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204);
	});

	it('/permissions/:id (GET) — obtener permiso eliminado debe retornar 404', async () => {
		await request(server)
			.get(`/permissions/${createdPermissionId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});

	it('/permissions/:id (DELETE) — eliminar permiso inexistente debe retornar 404', async () => {
		await request(server)
			.delete('/permissions/99999')
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});
});