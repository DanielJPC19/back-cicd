import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../core/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { DiagnosticsService } from './diagnostics.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { UpdateDiagnosticDto } from './dto/update-diagnostic.dto';

@ApiTags('diagnostics')
@ApiBearerAuth('jwt-auth')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('diagnostics')
export class DiagnosticsController {

	constructor(
		private readonly diagnosticsService: DiagnosticsService
	) {}

	@ApiOperation({ summary: 'Crear un diagnóstico' })
	@ApiBody({ type: CreateDiagnosticDto })
	@ApiResponse({ status: 201, description: 'Diagnóstico creado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Registro médico o veterinario no encontrado.' })
	@Permissions('diagnostic_create')
	@Post()
	async create(@Body() createDiagnosticDto: CreateDiagnosticDto) {
		const result = await this.diagnosticsService.create(createDiagnosticDto);
		return result;
	}

	@ApiOperation({ summary: 'Listar todos los diagnósticos' })
	@ApiQuery({ name: 'severity', required: false, description: 'Filtrar por severidad' })
	@ApiResponse({ status: 200, description: 'Lista de diagnósticos obtenida correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@Permissions('diagnostic_read')
	@Get()
	async findAll(@Query('severity') severity?: string) {
		if (severity) {
			const result = await this.diagnosticsService.findBySeverity(severity);
			return result;
		}
		const result = await this.diagnosticsService.findAll();
		return result;
	}

	@ApiOperation({ summary: 'Obtener un diagnóstico por ID' })
	@ApiParam({ name: 'id', description: 'ID del diagnóstico', type: 'number' })
	@ApiResponse({ status: 200, description: 'Diagnóstico obtenido correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Diagnóstico no encontrado.' })
	@Permissions('diagnostic_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.diagnosticsService.findOne(id);
		return result;
	}

	@ApiOperation({ summary: 'Obtener diagnósticos por registro médico' })
	@ApiParam({ name: 'medicalRecordId', description: 'ID del registro médico', type: 'number' })
	@ApiResponse({ status: 200, description: 'Diagnósticos del registro médico obtenidos correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Registro médico no encontrado.' })
	@Permissions('diagnostic_read')
	@Get('medical-record/:medicalRecordId')
	async findByMedicalRecord(@Param('medicalRecordId', ParseIntPipe) medicalRecordId: number) {
		const result = await this.diagnosticsService.findByMedicalRecord(medicalRecordId);
		return result;
	}

	@ApiOperation({ summary: 'Obtener diagnósticos por veterinario' })
	@ApiParam({ name: 'veterinarianId', description: 'ID del veterinario', type: 'number' })
	@ApiResponse({ status: 200, description: 'Diagnósticos del veterinario obtenidos correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Veterinario no encontrado.' })
	@Permissions('diagnostic_read')
	@Get('veterinarian/:veterinarianId')
	async findByVeterinarian(@Param('veterinarianId', ParseIntPipe) veterinarianId: number) {
		const result = await this.diagnosticsService.findByVeterinarian(veterinarianId);
		return result;
	}

	@ApiOperation({ summary: 'Actualizar un diagnóstico' })
	@ApiParam({ name: 'id', description: 'ID del diagnóstico', type: 'number' })
	@ApiBody({ type: UpdateDiagnosticDto })
	@ApiResponse({ status: 200, description: 'Diagnóstico actualizado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Diagnóstico no encontrado.' })
	@Permissions('diagnostic_update')
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateDiagnosticDto: UpdateDiagnosticDto,
	) {
		const result = await this.diagnosticsService.update(id, updateDiagnosticDto);
		return result;
	}

	@ApiOperation({ summary: 'Eliminar un diagnóstico' })
	@ApiParam({ name: 'id', description: 'ID del diagnóstico', type: 'number' })
	@ApiResponse({ status: 204, description: 'Diagnóstico eliminado correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Diagnóstico no encontrado.' })
	@Permissions('diagnostic_delete')
	@Delete(':id')
	@HttpCode(204)
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.diagnosticsService.removeById(id);
	}
}