import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Express } from 'express';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('RolesController (e2e)', () => {
	let app: INestApplication;
	let server: Express;
	let token: string;
	let createdRoleId: number;

	interface LoginResponse {
		access_token: string;
	}

	interface Permission {
		id: number;
		permissionName: string;
	}

	interface RoleResponse {
		id: number;
		roleName: string;
		description: string;
		permissions: Permission[];
	}

	interface PaginationResponse {
		data: RoleResponse[];
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

	it('/roles (POST) — crear rol nuevo', async () => {
		const response: Response = await request(server)
			.post('/roles')
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleName: 'moderator_e2e',
				description: 'Rol moderador con permisos limitados',
			})
			.expect(201);

		const body = response.body as RoleResponse;
		createdRoleId = body.id;

		expect(body).toHaveProperty('id');
		expect(body.roleName).toBe('moderator_e2e');
		expect(body.description).toBe('Rol moderador con permisos limitados');
	});

	it('/roles (GET) — listar todos los roles', async () => {
		const response: Response = await request(server)
			.get('/roles?page=1&limit=10')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as PaginationResponse;
		expect(Array.isArray(body.data)).toBe(true);
		expect(body).toHaveProperty('total');
		expect(body).toHaveProperty('page');
		expect(body).toHaveProperty('limit');
	});

	it('/roles/:id (GET) — obtener rol por ID', async () => {
		const response: Response = await request(server)
			.get(`/roles/${createdRoleId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as RoleResponse;
		expect(body.id).toBe(createdRoleId);
		expect(body.roleName).toBe('moderator_e2e');
	});

	it('/roles/:id (PATCH) — actualizar rol (roleName y description)', async () => {
		const response: Response = await request(server)
			.patch(`/roles/${createdRoleId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleName: 'moderator_e2e_updated',
				description: 'Rol moderador actualizado con nuevo nombre',
			})
			.expect(200);

		expect(response.body).toBeDefined();
		const body = response.body as RoleResponse;
		expect(body.roleName).toBe('moderator_e2e_updated');
		expect(body.description).toBe('Rol moderador actualizado con nuevo nombre');
	});

	it('/roles/permission (POST) — agregar permiso a un rol', async () => {
		// Obtener un permiso disponible
		const rolesResponse: Response = await request(server)
			.get('/roles/1')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		const existingRole = rolesResponse.body as RoleResponse;
		const permissionId = existingRole.permissions[0]?.id;

		if (!permissionId) {
			throw new Error('No hay permisos disponibles en el sistema');
		}

		const response: Response = await request(server)
			.post('/roles/permission')
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleId: createdRoleId,
				permissionId: permissionId,
			})
			.expect(200);

		expect(response.body).toBeDefined();
	});

	it('/roles (POST) — crear rol sin autenticación debe retornar 401', async () => {
		await request(server)
			.post('/roles')
			.send({
				roleName: 'unauthorized_role',
				description: 'Este debe fallar',
			})
			.expect(401);
	});

	it('/roles (POST) — usuario sin permisos debe retornar 403', async () => {
		// Login como usuario normal (sin permisos de crear roles)
		const userAuthResponse: Response = await request(server)
			.post('/auth/login')
			.send({
				email: 'user@mail.com',
				password: 'userpass456',
			})
			.expect(201);

		const userToken = (userAuthResponse.body as LoginResponse).access_token;

		await request(server)
			.post('/roles')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				roleName: 'forbidden_role',
				description: 'Sin permisos',
			})
			.expect(403);
	});

	it('/roles (POST) — rol duplicado debe retornar 409', async () => {
		// Crear primer rol
		await request(server)
			.post('/roles')
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleName: 'duplicate_test',
				description: 'Rol para probar duplicado',
			})
			.expect(201);

		// Intentar crear otro con el mismo nombre
		await request(server)
			.post('/roles')
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleName: 'duplicate_test',
				description: 'Intento de duplicado',
			})
			.expect(409);
	});

	it('/roles/:id (GET) — rol inexistente debe retornar 404', async () => {
		await request(server)
			.get('/roles/99999')
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});



	it('/roles/:id (PATCH) — rol duplicado al actualizar debe retornar 409', async () => {
		// Primero crear un segundo rol para tener dos roles
		const secondRoleResponse: Response = await request(server)
			.post('/roles')
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleName: 'second_test_role',
				description: 'Segundo rol para prueba de duplicado',
			})
			.expect(201);

		const secondRoleId = (secondRoleResponse.body as RoleResponse).id;

		// Intentar actualizar el primer rol con el nombre del segundo rol
		await request(server)
			.patch(`/roles/${createdRoleId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleName: 'second_test_role', // Nombre del otro rol
				description: 'Intento de cambiar a nombre existente',
			})
			.expect(409);

		// Limpiar: eliminar el segundo rol
		await request(server)
			.delete(`/roles/${secondRoleId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204);
	});

	it('/roles/permission (POST) — agregar permiso con rol inexistente debe retornar 404', async () => {
		const rolesResponse: Response = await request(server)
			.get('/roles/1')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		const existingRole = rolesResponse.body as RoleResponse;
		const permissionId = existingRole.permissions[0]?.id;

		await request(server)
			.post('/roles/permission')
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleId: 99999, // Rol inexistente
				permissionId: permissionId,
			})
			.expect(404);
	});

	it('/roles/permission (POST) — agregar permiso inexistente debe retornar 404', async () => {
		await request(server)
			.post('/roles/permission')
			.set('Authorization', `Bearer ${token}`)
			.send({
				roleId: createdRoleId,
				permissionId: 99999, // Permiso inexistente
			})
			.expect(404);
	});

	it('/roles/:id (DELETE) — eliminar rol', async () => {
		await request(server)
			.delete(`/roles/${createdRoleId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204);
	});

	it('/roles/:id (GET) — obtener rol eliminado debe retornar 404', async () => {
		await request(server)
			.get(`/roles/${createdRoleId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});

	it('/roles/:id (DELETE) — eliminar rol inexistente debe retornar 404', async () => {
		await request(server)
			.delete('/roles/99999')
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});
});