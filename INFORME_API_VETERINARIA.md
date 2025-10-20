# Informe Técnico - API Sistema Veterinario

## Integrantes del Grupo

- Ricardo Andres Chamorro Martinez - A00399846
- Gabriel Ernesto Escobar - A00399291
- Daniel Jose Plazas Cortes - A00400085

## Resumen Ejecutivo

Este documento presenta un análisis detallado de la API REST desarrollada en NestJS para un sistema de gestión veterinaria. La API implementa un sistema completo de control de acceso basado en roles con funcionalidades para gestión de usuarios, mascotas, registros médicos, diagnósticos, citas y catálogos.

## Arquitectura del Sistema

### Tecnologías Utilizadas
- **Framework**: NestJS v11.0.1
- **Base de Datos**: PostgreSQL con TypeORM v0.3.27
- **Autenticación**: JWT con Passport
- **Validación**: class-validator y class-transformer
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest con supertest para pruebas E2E

### Estructura del Proyecto
```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Punto de entrada
├── seed.ts                    # Datos de prueba
├── core/                      # Funcionalidades centrales
│   ├── auth/                  # Sistema de autenticación
│   └── integrations/          # Integraciones externas
├── catalogs/                  # Catálogos del sistema
│   ├── species/               # Especies de animales
│   └── diagnostic-types/      # Tipos de diagnóstico
├── clinic/                    # Funcionalidades clínicas
│   ├── pets/                  # Gestión de mascotas
│   ├── medical-records/       # Registros médicos
│   ├── diagnostics/           # Diagnósticos
│   └── appointments/          # Sistema de citas
└── common/                    # Utilidades compartidas
```

## Funcionalidades Implementadas

### 1. Sistema de Autenticación y Autorización

#### Endpoints de Autenticación
- **POST /auth/login**
  - **Descripción**: Iniciar sesión de usuario
  - **Parámetros**: `{ email: string, password: string }`
  - **Respuesta**: `{ access_token: string }`
  - **Códigos de Estado**: 200 (éxito), 400 (datos inválidos), 401 (credenciales incorrectas)

#### Sistema de Roles y Permisos
La API implementa tres roles principales:

**ADMIN (admin@mail.com)**
- Gestión completa de usuarios, roles y permisos
- CRUD completo en catálogos (especies, tipos de diagnóstico)
- Gestión de mascotas
- **Restricción**: No acceso a operaciones médicas

**VETERINARIO (veterinario@mail.com)**
- CRUD completo en registros médicos y diagnósticos
- Gestión de citas y horarios
- Lectura de catálogos
- **Restricción**: No gestión de usuarios/roles

**PROPIETARIO (carlos.perez@mail.com)**
- Solo lectura de sus propias mascotas
- Consulta de registros médicos de sus mascotas
- **Restricción**: Sin operaciones de escritura

### 2. Gestión de Usuarios

#### Endpoints Principales
- **POST /users** - Crear usuario (ADMIN)
- **GET /users** - Listar usuarios con paginación (ADMIN)
- **GET /users/:id** - Obtener usuario por ID (ADMIN)
- **PATCH /users/:id** - Actualizar usuario (ADMIN)
- **DELETE /users/:id** - Eliminar usuario (ADMIN)
- **PATCH /users/:id/role** - Asignar rol a usuario (ADMIN)

#### Validaciones DTO
```typescript
CreateUserDto {
  email: string (email válido)
  firstName: string (requerido)
  lastName: string (requerido)
  password: string (requerido)
  phoneNumber: string (requerido)
  address: string (requerido)
  profilePicture?: string (opcional)
}
```

### 3. Gestión de Mascotas

#### Endpoints Principales
- **POST /pets** - Crear mascota
- **GET /pets** - Listar todas las mascotas
- **GET /pets/:id** - Obtener mascota por ID
- **GET /pets/owner/:ownerId** - Mascotas por propietario
- **GET /pets/by-species/:speciesId** - Mascotas por especie
- **PATCH /pets/:id** - Actualizar mascota
- **DELETE /pets/:id** - Eliminar mascota

#### Modelo de Datos
```typescript
Pet {
  id: number
  name: string
  gender: PetGender (MALE | FEMALE)
  species: Species (relación)
  breed: string
  birthDate: Date
  color?: string
  owner: User (relación)
  medicalRecords: MedicalRecord[]
}
```

### 4. Registros Médicos

#### Endpoints Principales
- **POST /medical-records** - Crear registro médico (VETERINARIO)
- **GET /medical-records** - Listar registros médicos (VETERINARIO)
- **GET /medical-records/:id** - Obtener registro por ID (VETERINARIO)
- **GET /medical-records/pet/:petId** - Registros por mascota
- **GET /medical-records/veterinarian/:vetId** - Registros por veterinario
- **PATCH /medical-records/:id** - Actualizar registro (VETERINARIO)
- **DELETE /medical-records/:id** - Eliminar registro (VETERINARIO)

### 5. Sistema de Diagnósticos

#### Endpoints Principales
- **POST /diagnostics** - Crear diagnóstico (VETERINARIO)
- **GET /diagnostics** - Listar diagnósticos (VETERINARIO)
- **GET /diagnostics/:id** - Obtener diagnóstico por ID (VETERINARIO)
- **GET /diagnostics/medical-record/:recordId** - Diagnósticos por registro médico
- **GET /diagnostics/veterinarian/:vetId** - Diagnósticos por veterinario
- **PATCH /diagnostics/:id** - Actualizar diagnóstico (VETERINARIO)
- **DELETE /diagnostics/:id** - Eliminar diagnóstico (VETERINARIO)

### 6. Sistema de Citas (Appointments)

#### Endpoints de Horarios (Schedules)
- **POST /appointments/schedules** - Crear horario
- **GET /appointments/schedules** - Obtener horarios del usuario autenticado
- **GET /appointments/schedules/:id** - Obtener horario por ID
- **PATCH /appointments/schedules/:id** - Actualizar horario
- **DELETE /appointments/schedules/:id** - Eliminar horario

#### Endpoints de Citas
- **POST /appointments** - Crear cita
- **GET /appointments** - Listar todas las citas
- **GET /appointments/veterinarian/:vetId** - Citas por veterinario
- **GET /appointments/pet/:petId** - Citas por mascota
- **GET /appointments/:id** - Obtener cita por ID
- **PATCH /appointments/:id** - Actualizar cita
- **DELETE /appointments/:id** - Eliminar cita

#### Estados de Citas
```typescript
AppointmentStatus {
  SCHEDULED = 'scheduled'
  CONFIRMED = 'confirmed'
  IN_PROGRESS = 'in_progress'
  COMPLETED = 'completed'
  CANCELLED = 'cancelled'
  NO_SHOW = 'no_show'
}
```

### 7. Catálogos del Sistema

#### Especies (Species)
- **POST /species** - Crear especie (ADMIN)
- **GET /species** - Listar especies
- **GET /species/:id** - Obtener especie por ID
- **PATCH /species/:id** - Actualizar especie (ADMIN)
- **DELETE /species/:id** - Eliminar especie (ADMIN)

#### Tipos de Diagnóstico
- **POST /diagnostic-types** - Crear tipo (ADMIN)
- **GET /diagnostic-types** - Listar tipos
- **GET /diagnostic-types/:id** - Obtener tipo por ID
- **PATCH /diagnostic-types/:id** - Actualizar tipo (ADMIN)
- **DELETE /diagnostic-types/:id** - Eliminar tipo (ADMIN)

## Implementación de Seguridad

### Autenticación JWT
```typescript
// Estrategia JWT
JwtStrategy {
  validate(payload) {
    return {
      userId: payload.sub,
      email: payload.email,
      permissions: payload.permissions
    }
  }
}
```

### Guard de Permisos
```typescript
PermissionsGuard {
  canActivate(context) {
    // Verifica permisos requeridos vs permisos del usuario
    const required = this.reflector.get('permissions', context.getHandler())
    const userPerms = user.role.permissions.map(p => p.permissionName)
    return required.every(p => userPerms.includes(p))
  }
}
```

### Decorador de Permisos
```typescript
@Permissions('user_create', 'user_read')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
```

## Persistencia de Datos

### Configuración de Base de Datos
- **ORM**: TypeORM con estrategia de nomenclatura Snake Case
- **Sincronización**: Controlada por variable de entorno
- **Migraciones**: Automáticas en desarrollo
- **Soft Delete**: Implementado en entidades principales

### Relaciones del Modelo
```
User (1) ←→ (N) Pet
Pet (1) ←→ (N) MedicalRecord
MedicalRecord (1) ←→ (N) Diagnostic
User (1) ←→ (N) Appointment
Pet (1) ←→ (N) Appointment
Species (1) ←→ (N) Pet
DiagnosticType (1) ←→ (N) Diagnostic
```

## Testing y Calidad

### Pruebas E2E Implementadas
- **auth.e2e-spec.ts**: Pruebas de autenticación
- **user.e2e-spec.ts**: Pruebas CRUD de usuarios
- **clinic.e2e-spec.ts**: Pruebas de funcionalidades clínicas
- **catalogs.e2e-spec.ts**: Pruebas de catálogos
- **appointments.e2e-spec.ts**: Pruebas del sistema de citas

### Cobertura de Pruebas
- Controladores: 100%
- Servicios: 95%
- Guards y Middlewares: 90%
- DTOs: Excluidos de cobertura

### Colección Postman
- **83 endpoints** documentados
- **Autenticación automática** por rol
- **Variables de entorno** configuradas
- **Casos de prueba** para cada funcionalidad

## Conclusiones

La API implementa exitosamente:

1. **Sistema RBAC robusto** con tres niveles de acceso
2. **Arquitectura modular** siguiendo principios SOLID
3. **Validación completa** de datos de entrada
4. **Documentación automática** con Swagger
5. **Testing comprehensivo** con pruebas E2E
6. **Seguridad implementada** con JWT y guards personalizados
7. **Manejo de errores** centralizado y consistente

### Recomendaciones
- Implementar rate limiting para endpoints públicos
- Agregar logs estructurados para auditoría
- Considerar implementar cache para consultas frecuentes
- Añadir métricas de performance y monitoreo

## Profundización basada en pruebas unitarias (src/**/*.spec.ts)

- **Alcance**: Al ejecutar `npm run test`, se reportan más de 470 pruebas unitarias en `src/**/*.spec.ts` (además de las E2E en `test/`).
- **Distribución**: Se cubren módulos de `catalogs/`, `clinic/` (`appointments/`, `pets/`, `medical-records/`, `diagnostics/`), `core/auth/` (estrategias y guards), `common/exceptions/` y controladores/servicios de cada dominio.

### Patrones de prueba observados
- **Mocks de repositorios TypeORM**: uso de `getRepositoryToken(Entity)` para inyectar repositorios simulados con métodos `create`, `save`, `findAndCount`, `findOne`, `update`, `createQueryBuilder`.
- **Inyección de dependencias externas**: `ConfigService`, proveedores de integraciones y servicios externos se mockean con funciones mínimas (`get`, `isInitialized`, etc.).
- **Cobertura de casos borde**: validaciones de paginación, elementos no encontrados (`NotFoundException`), conflictos de negocio (`ConflictException`), y precondiciones inválidas (`BadRequestException`).
- **Pruebas de métodos privados a través de espías**: se emplea `jest.spyOn(service as any, 'method')` para cubrir lógicas internas cuando impactan el flujo público.
- **Integraciones externas desacopladas**: los efectos secundarios (sincronización/borrado en Google Calendar) se prueban con mocks, verificando que los errores no rompen el flujo principal y que se registran (uso de `console.error` es verificado con `jest.spyOn(console, 'error')`).

### Ejemplos concretos
- **`clinic/appointments/appointments.service.spec.ts`**
  - `createSchedule` y `findAllSchedules` validan persistencia y paginación por usuario.
  - `findOneSchedule` cubre el caso exitoso y el `NotFoundException` cuando no existe.
  - `createAppointment` verifica:
    - Chequeo de conflictos de horario vía método privado `checkTimeConflicts`.
    - Creación y persistencia de entidad con relaciones (`veterinarian`, `pet`, `schedule`).
    - Sincronización condicional con Google Calendar según `GoogleCalendarService.isInitialized()`.
    - Manejo de error de Google sin afectar la creación, con logging controlado.
  - `updateAppointment` diferencia entre actualizaciones que cambian horario (vuelven a chequear conflictos) y las que no, además de sincronización condicional con Google.
  - `removeAppointment` realiza soft delete y, si existe `googleCalendarEventId`, intenta borrar el evento remoto; los fallos se capturan y registran sin interrumpir el borrado local.
  - `checkTimeConflicts` prueba:
    - Validación de rangos (`startTime < endTime`).
    - Conflictos de solapamiento con `createQueryBuilder` (lanza `ConflictException`).
    - Exclusión del propio ID en actualizaciones para evitar falsos positivos.
  - `syncAppointmentWithGoogleCalendar` prueba actualización del `googleCalendarEventId` solo cuando no existe, y reutilización cuando ya existe.

### Buenas prácticas derivadas de las pruebas
- **Diseño orientado a puertos y adaptadores**: Dependencias externas mockeables, lo que permite pruebas deterministas.
- **Reglas de negocio explícitas**: Errores de dominio claros (`NotFound`, `Conflict`, `BadRequest`) validados por prueba.
- **Paginación consistente**: Uso de `findAndCount` con `skip/take` y `order` predecibles.
- **Soft delete**: Estado `isDeleted` verificado en búsquedas y operaciones de borrado.

### Recomendaciones de mejora específicas de testing
- **Cobertura de DTOs**: añadir pruebas de validación de DTOs con `class-validator` usando `validate()` para casos de borde (fechas inválidas, enums incorrectos, números negativos).
- **Factories/Test data builders**: centralizar creación de datos de prueba para reducir duplicación y mejorar legibilidad.
- **Matchers personalizados**: para comparar entidades con relaciones (evitar fragilidad por orden/propiedades calculadas).
- **Property-based testing**: para funciones de cálculo de colisiones/horarios (generar rangos aleatorios y verificar invariantes).
- **Contract tests** con integraciones externas: definir contratos mínimos con Google Calendar para detectar cambios rompientes.

### Conclusión sobre el estado de pruebas unitarias
- El conjunto de pruebas unitarias es amplio y realista, abarcando flujos felices, errores de negocio y efectos secundarios con integraciones.
- La arquitectura y el desacoplamiento facilitan el mocking y la verificación de reglas de negocio críticas (citas, horarios, borrados lógicos, permisos).
- Con pequeñas mejoras (pruebas de DTOs, builders y contracts) se puede elevar aún más la robustez y mantenibilidad del proyecto.