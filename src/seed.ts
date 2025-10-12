import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Permission } from './core/auth/entities/permission.entity';
import { Role } from './core/auth/entities/role.entity';
import { User } from './core/auth/entities/user.entity';

dotenv.config();

type SupportedDbTypes =
  | 'mysql'
  | 'postgres'
  | 'sqlite'
  | 'mariadb'
  | 'mongodb'
  | 'oracle';

const AppDataSource = new DataSource({
	type: (process.env.DB_TYPE as SupportedDbTypes) || 'postgres',
	host: process.env.DB_HOST || 'localhost',
	port: Number(process.env.DB_PORT) || 5432,
	username: process.env.DB_USERNAME || 'root',
	password: process.env.DB_PASSWORD || 'root',
	database: process.env.DB_DATABASE || 'vet',
	entities: [__dirname + '/**/*.entity{.ts,.js}'],
	synchronize: true,
	namingStrategy: new SnakeNamingStrategy(),
});

async function seed() {
	await AppDataSource.initialize();

	console.log('Limpiando tablas...');
	await AppDataSource.query('TRUNCATE TABLE diagnostics, medical_records, pets, roles_permissions, users, roles, permissions RESTART IDENTITY CASCADE');

	console.log('Creando roles...');
	const adminRole = AppDataSource.manager.create(Role, {
		roleName: 'admin',
		description: 'Administrador con todos los permisos',
	});
	const userRole = AppDataSource.manager.create(Role, {
		roleName: 'user',
		description: 'Usuario estándar con permisos limitados',
	});
	await AppDataSource.manager.save([adminRole, userRole]);

	console.log('Creando permisos...');
	const permissions = [
		'user_create', 'user_read', 'user_update', 'user_delete','user_add_role',
		'permission_create', 'permission_read', 'permission_update', 'permission_delete',
		'role_create', 'role_read', 'role_update', 'role_delete','role_add_permission',
		'pet_create', 'pet_read', 'pet_update', 'pet_delete',
		'medical_record_create', 'medical_record_read', 'medical_record_update', 'medical_record_delete',
		'diagnostic_create', 'diagnostic_read', 'diagnostic_update', 'diagnostic_delete',
	].map((name) => AppDataSource.manager.create(Permission, { permissionName: name }));

	await AppDataSource.manager.save(permissions);

	const allPermissions = await AppDataSource.manager.find(Permission);

	console.log('Asignando permisos...');
	adminRole.permissions = allPermissions;
	userRole.permissions = allPermissions.filter((p) =>
		['user_read', 'permission_read', 'role_read', 'pet_read', 'medical_record_read', 'diagnostic_read'].includes(p.permissionName)
	);

	await AppDataSource.manager.save([adminRole, userRole]);

	console.log('Creando usuarios...');
	const saltRounds = 10;
	const hashedPassword1 = await bcrypt.hash('password123', saltRounds);
	const hashedPassword2 = await bcrypt.hash('userpass456', saltRounds);

	const users = [
		{
			firstName: 'Admin',
			lastName: 'Principal',
			email: 'admin@mail.com',
			password: hashedPassword1,
			phoneNumber: '1234567890',
			address: 'Oficina Central',
			role: adminRole,
		},
		{
			firstName: 'Usuario',
			lastName: 'Normal',
			email: 'user@mail.com',
			password: hashedPassword2,
			phoneNumber: '0987654321',
			address: 'Ciudad',
			role: userRole,
		},
	];
	await AppDataSource.manager.save(User, users);

	console.log('Seed completo');
	await AppDataSource.destroy();
}

seed().catch((error) => {
	console.error('Error en el seed:', error);
	void AppDataSource.destroy();
});
