import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../core/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

@ApiTags('medical-records')
@ApiBearerAuth('jwt-auth')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('medical-records')
export class MedicalRecordsController {

	constructor(
		private readonly medicalRecordsService: MedicalRecordsService
	) {}

	@ApiOperation({ summary: 'Crear un registro médico' })
	@ApiBody({ type: CreateMedicalRecordDto })
	@ApiResponse({ status: 201, description: 'Registro médico creado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Mascota o veterinario no encontrado.' })
	@Permissions('medical_record_create')
	@Post()
	async create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
		const result = await this.medicalRecordsService.create(createMedicalRecordDto);
		return result;
	}

	@ApiOperation({ summary: 'Listar todos los registros médicos' })
	@ApiResponse({ status: 200, description: 'Lista de registros médicos obtenida correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@Permissions('medical_record_read')
	@Get()
	async findAll() {
		const result = await this.medicalRecordsService.findAll();
		return result;
	}

	@ApiOperation({ summary: 'Obtener un registro médico por ID' })
	@ApiParam({ name: 'id', description: 'ID del registro médico', type: 'number' })
	@ApiResponse({ status: 200, description: 'Registro médico obtenido correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Registro médico no encontrado.' })
	@Permissions('medical_record_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.medicalRecordsService.findOne(id);
		return result;
	}

	@ApiOperation({ summary: 'Obtener registros médicos por mascota' })
	@ApiParam({ name: 'petId', description: 'ID de la mascota', type: 'number' })
	@ApiResponse({ status: 200, description: 'Registros médicos de la mascota obtenidos correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Mascota no encontrada.' })
	@Permissions('medical_record_read')
	@Get('pet/:petId')
	async findByPet(@Param('petId', ParseIntPipe) petId: number) {
		const result = await this.medicalRecordsService.findByPet(petId);
		return result;
	}

	@ApiOperation({ summary: 'Obtener registros médicos por veterinario' })
	@ApiParam({ name: 'veterinarianId', description: 'ID del veterinario', type: 'number' })
	@ApiResponse({ status: 200, description: 'Registros médicos del veterinario obtenidos correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Veterinario no encontrado.' })
	@Permissions('medical_record_read')
	@Get('veterinarian/:veterinarianId')
	async findByVeterinarian(@Param('veterinarianId', ParseIntPipe) veterinarianId: number) {
		const result = await this.medicalRecordsService.findByVeterinarian(veterinarianId);
		return result;
	}

	@ApiOperation({ summary: 'Actualizar un registro médico' })
	@ApiParam({ name: 'id', description: 'ID del registro médico', type: 'number' })
	@ApiBody({ type: UpdateMedicalRecordDto })
	@ApiResponse({ status: 200, description: 'Registro médico actualizado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Registro médico no encontrado.' })
	@Permissions('medical_record_update')
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
	) {
		const result = await this.medicalRecordsService.update(id, updateMedicalRecordDto);
		return result;
	}

	@ApiOperation({ summary: 'Eliminar un registro médico' })
	@ApiParam({ name: 'id', description: 'ID del registro médico', type: 'number' })
	@ApiResponse({ status: 204, description: 'Registro médico eliminado correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Registro médico no encontrado.' })
	@Permissions('medical_record_delete')
	@Delete(':id')
	@HttpCode(204)
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.medicalRecordsService.removeById(id);
	}
}