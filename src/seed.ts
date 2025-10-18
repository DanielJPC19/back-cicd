import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DiagnosticType } from './catalogs/diagnostic-types/entities/diagnostic-type.entity';
import { Species } from './catalogs/species/entities/species.entity';
import { Diagnostic, DiagnosticSeverity } from './clinic/diagnostics/entities/diagnostic.entity';
import { MedicalRecord, PetSize } from './clinic/medical-records/entities/medical-record.entity';
import { Pet, PetGender } from './clinic/pets/entities/pet.entity';
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
	await AppDataSource.query('TRUNCATE TABLE diagnostics, medical_records, pets, species, diagnostic_types, roles_permissions, users, roles, permissions RESTART IDENTITY CASCADE');

	console.log('Creando roles...');
	const adminRole = AppDataSource.manager.create(Role, {
		roleName: 'admin',
		description: 'Administrador del sistema - gestiona usuarios, roles y catálogos',
	});
	const veterinarianRole = AppDataSource.manager.create(Role, {
		roleName: 'veterinarian',
		description: 'Veterinario - maneja historias clínicas y diagnósticos médicos',
	});
	const userRole = AppDataSource.manager.create(Role, {
		roleName: 'user',
		description: 'Usuario/Propietario - solo lectura de información',
	});
	await AppDataSource.manager.save([adminRole, veterinarianRole, userRole]);

	console.log('Creando permisos...');
	const permissions = [
		'user_create', 'user_read', 'user_update', 'user_delete','user_add_role',
		'permission_create', 'permission_read', 'permission_update', 'permission_delete',
		'role_create', 'role_read', 'role_update', 'role_delete','role_add_permission',
		'pet_create', 'pet_read', 'pet_update', 'pet_delete',
		'medical_record_create', 'medical_record_read', 'medical_record_update', 'medical_record_delete',
		'diagnostic_create', 'diagnostic_read', 'diagnostic_update', 'diagnostic_delete',
		// Permisos para catálogos (Species)
		'CREATE_SPECIES', 'READ_SPECIES', 'UPDATE_SPECIES', 'DELETE_SPECIES',
		// Permisos para catálogos (Diagnostic Types)
		'CREATE_DIAGNOSTIC_TYPE', 'READ_DIAGNOSTIC_TYPE', 'UPDATE_DIAGNOSTIC_TYPE', 'DELETE_DIAGNOSTIC_TYPE',
	].map((name) => AppDataSource.manager.create(Permission, { permissionName: name }));

	await AppDataSource.manager.save(permissions);

	const allPermissions = await AppDataSource.manager.find(Permission);

	console.log('Asignando permisos...');
	
	// ADMIN: TODOS los permisos EXCEPTO medical records y diagnostics
	adminRole.permissions = allPermissions.filter((p) =>
		!['medical_record_create', 'medical_record_read', 'medical_record_update', 'medical_record_delete',
		  'diagnostic_create', 'diagnostic_read', 'diagnostic_update', 'diagnostic_delete'].includes(p.permissionName)
	);

	// VETERINARIO: Solo funciones médicas
	veterinarianRole.permissions = allPermissions.filter((p) =>
		['pet_read', 'pet_update',
		 'medical_record_create', 'medical_record_read', 'medical_record_update', 'medical_record_delete',
		 'diagnostic_create', 'diagnostic_read', 'diagnostic_update', 'diagnostic_delete',
		 'READ_SPECIES', 'READ_DIAGNOSTIC_TYPE'].includes(p.permissionName)
	);

	// USUARIO/PROPIETARIO: SOLO LECTURA - únicamente sus mascotas y registros médicos
	userRole.permissions = allPermissions.filter((p) =>
		['pet_read', 'medical_record_read'].includes(p.permissionName)
	);

	await AppDataSource.manager.save([adminRole, veterinarianRole, userRole]);

	console.log('Creando especies...');
	const speciesData = [
		{ id: 1, name: 'Perro', description: 'Canis lupus familiaris' },
		{ id: 2, name: 'Gato', description: 'Felis catus' },
		{ id: 3, name: 'Ave', description: 'Aves domésticas' },
		{ id: 4, name: 'Conejo', description: 'Oryctolagus cuniculus' },
		{ id: 5, name: 'Hamster', description: 'Cricetinae' },
	];
	const species = speciesData.map((data) => AppDataSource.manager.create(Species, data));

	await AppDataSource.manager.save(species);

	console.log('Creando tipos de diagnóstico...');
	const diagnosticTypesData = [
		{ id: 1, name: 'Consulta General' },
		{ id: 2, name: 'Vacunación' },
		{ id: 3, name: 'Cirugía' },
		{ id: 4, name: 'Emergencia' },
		{ id: 5, name: 'Control Rutinario' },
		{ id: 6, name: 'Dental' },
		{ id: 7, name: 'Dermatológica' },
	];
	const diagnosticTypes = diagnosticTypesData.map((data) => AppDataSource.manager.create(DiagnosticType, data));

	await AppDataSource.manager.save(diagnosticTypes);

	console.log('Creando usuarios...');
	const saltRounds = 10;
	const hashedPassword1 = await bcrypt.hash('password123', saltRounds);
	const hashedPassword2 = await bcrypt.hash('vetpass123', saltRounds);
	const hashedPassword3 = await bcrypt.hash('userpass456', saltRounds);
	const hashedPassword4 = await bcrypt.hash('owner123', saltRounds);
	const hashedPassword5 = await bcrypt.hash('owner456', saltRounds);

	const users = [
		{
			firstName: 'Admin',
			lastName: 'Sistema',
			email: 'admin@mail.com',
			password: hashedPassword1,
			phoneNumber: '1234567890',
			address: 'Oficina Central',
			role: adminRole,
		},
		{
			firstName: 'Dr. Juan',
			lastName: 'Veterinario',
			email: 'veterinario@mail.com',
			password: hashedPassword2,
			phoneNumber: '1111111111',
			address: 'Clínica Veterinaria',
			role: veterinarianRole,
		},
		{
			firstName: 'Usuario',
			lastName: 'Normal',
			email: 'user@mail.com',
			password: hashedPassword3,
			phoneNumber: '0987654321',
			address: 'Ciudad',
			role: userRole,
		},
		{
			firstName: 'Carlos',
			lastName: 'Pérez',
			email: 'carlos.perez@mail.com',
			password: hashedPassword4,
			phoneNumber: '5551234567',
			address: 'Avenida Principal 123',
			role: userRole,
		},
		{
			firstName: 'María',
			lastName: 'González',
			email: 'maria.gonzalez@mail.com',
			password: hashedPassword5,
			phoneNumber: '5557654321',
			address: 'Calle Secundaria 456',
			role: userRole,
		},
	];
	const savedUsers = await AppDataSource.manager.save(User, users);
	// const adminUser = savedUsers[0];
	const veterinarianUser = savedUsers[1];
	// const normalUser = savedUsers[2];
	const ownerCarlos = savedUsers[3];
	const ownerMaria = savedUsers[4];

	console.log('Creando mascotas...');
	const [dogSpecies, catSpecies, birdSpecies] = species;
	
	const pets = [
		{
			id: 1,
			name: 'Firulais',
			age: 3,
			gender: PetGender.MALE,
			birthDate: new Date('2021-01-15'),
			color: 'Café y blanco',
			breed: 'Mestizo',
			species: dogSpecies,
			owner: ownerCarlos,
		},
		{
			id: 2,
			name: 'Mishi',
			age: 2,
			gender: PetGender.FEMALE,
			birthDate: new Date('2022-03-10'),
			color: 'Gris atigrado',
			breed: 'Persa',
			species: catSpecies,
			owner: ownerMaria,
		},
		{
			id: 3,
			name: 'Piolín',
			age: 1,
			gender: PetGender.MALE,
			birthDate: new Date('2023-05-20'),
			color: 'Amarillo',
			breed: 'Canario',
			species: birdSpecies,
			owner: ownerCarlos,
		},
	].map((data) => AppDataSource.manager.create(Pet, data));

	const savedPets = await AppDataSource.manager.save(pets);

	console.log('Creando historias clínicas...');
	const medicalRecords: MedicalRecord[] = [];
	for (let i = 0; i < savedPets.length; i++) {
		const pet = savedPets[i];
		const weights = [25.5, 4.2, 0.15];
		const sizes = [PetSize.MEDIUM, PetSize.SMALL, PetSize.SMALL];
		
		const medicalRecord = AppDataSource.manager.create(MedicalRecord, {
			id: i + 1, // Forzar IDs: 1, 2, 3
			pet: pet,
			veterinarian: veterinarianUser,
			openingDate: new Date('2024-01-15'),
			weight: weights[i],
			size: sizes[i],
			allergies: i === 0 ? 'Alérgico al pollo' : undefined,
			medications: i === 1 ? 'Vitaminas diarias' : undefined,
			vaccinationStatus: 'Vacunas al día',
		});
		medicalRecords.push(medicalRecord);
	}

	const savedMedicalRecords = await AppDataSource.manager.save(medicalRecords);

	console.log('Creando diagnósticos...');
	const [consultaGeneral, vacunacion, controlRutinario] = diagnosticTypes;
	
	const diagnostics: Diagnostic[] = [];
	
	const diagnosticData = [
		{
			medicalRecord: savedMedicalRecords[0],
			veterinarian: veterinarianUser,
			type: consultaGeneral,
			visitDate: new Date('2024-01-15'),
			reason: 'Consulta de rutina',
			symptoms: 'Activo y saludable',
			examination: 'Examen físico normal, peso adecuado',
			severity: DiagnosticSeverity.LOW,
			recommendations: 'Continuar con dieta balanceada, ejercicio regular',
		},
		{
			medicalRecord: savedMedicalRecords[1],
			veterinarian: veterinarianUser,
			type: vacunacion,
			visitDate: new Date('2024-02-10'),
			reason: 'Vacunación anual',
			symptoms: undefined,
			examination: 'Estado general excelente',
			severity: DiagnosticSeverity.LOW,
			recommendations: 'Próxima vacuna en 12 meses, mantener calendario',
		},
		{
			medicalRecord: savedMedicalRecords[2],
			veterinarian: veterinarianUser,
			type: controlRutinario,
			visitDate: new Date('2024-03-05'),
			reason: 'Control de crecimiento',
			symptoms: 'Desarrollo normal',
			examination: 'Crecimiento adecuado para la edad',
			severity: DiagnosticSeverity.LOW,
			recommendations: 'Control en 3 meses, alimentación balanceada',
		},
	];
	
	for (const data of diagnosticData) {
		const diagnostic = AppDataSource.manager.create(Diagnostic, data);
		diagnostics.push(diagnostic);
	}

	await AppDataSource.manager.save(diagnostics);

	console.log('Seed completo');
	await AppDataSource.destroy();
}

seed().catch((error) => {
	console.error('Error en el seed:', error);
	void AppDataSource.destroy();
});
