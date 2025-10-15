import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../core/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { DiagnosticTypesService } from './diagnostic-types.service';
import { CreateDiagnosticTypeDto } from './dto/create-diagnostic-type.dto';
import { UpdateDiagnosticTypeDto } from './dto/update-diagnostic-type.dto';

@ApiTags('Diagnostic Types')
@Controller('diagnostic-types')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DiagnosticTypesController {
	constructor(private readonly diagnosticTypesService: DiagnosticTypesService) {}

	@Post()
	@Permissions('CREATE_DIAGNOSTIC_TYPE')
	@ApiOperation({ summary: 'Crear un nuevo tipo de diagnóstico' })
	@ApiResponse({ status: 201, description: 'Tipo de diagnóstico creado exitosamente.' })
	@ApiResponse({ status: 409, description: 'Ya existe un tipo de diagnóstico con ese nombre.' })
	async create(@Body() createDiagnosticTypeDto: CreateDiagnosticTypeDto) {
		return await this.diagnosticTypesService.create(createDiagnosticTypeDto);
	}

	@Get()
	@Permissions('READ_DIAGNOSTIC_TYPE')
	@ApiOperation({ summary: 'Obtener todos los tipos de diagnóstico' })
	@ApiResponse({ status: 200, description: 'Lista de tipos de diagnóstico obtenida exitosamente.' })
	async findAll() {
		return await this.diagnosticTypesService.findAll();
	}

	@Get(':id')
	@Permissions('READ_DIAGNOSTIC_TYPE')
	@ApiOperation({ summary: 'Obtener un tipo de diagnóstico por ID' })
	@ApiResponse({ status: 200, description: 'Tipo de diagnóstico encontrado exitosamente.' })
	@ApiResponse({ status: 404, description: 'Tipo de diagnóstico no encontrado.' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return await this.diagnosticTypesService.findOne(id);
	}

	@Patch(':id')
	@Permissions('UPDATE_DIAGNOSTIC_TYPE')
	@ApiOperation({ summary: 'Actualizar un tipo de diagnóstico' })
	@ApiResponse({ status: 200, description: 'Tipo de diagnóstico actualizado exitosamente.' })
	@ApiResponse({ status: 404, description: 'Tipo de diagnóstico no encontrado.' })
	@ApiResponse({ status: 409, description: 'Ya existe un tipo de diagnóstico con ese nombre.' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateDiagnosticTypeDto: UpdateDiagnosticTypeDto,
	) {
		return await this.diagnosticTypesService.update(id, updateDiagnosticTypeDto);
	}

	@Delete(':id')
	@Permissions('DELETE_DIAGNOSTIC_TYPE')
	@HttpCode(204)
	@ApiOperation({ summary: 'Eliminar un tipo de diagnóstico' })
	@ApiResponse({ status: 204, description: 'Tipo de diagnóstico eliminado exitosamente.' })
	@ApiResponse({ status: 404, description: 'Tipo de diagnóstico no encontrado.' })
	async remove(@Param('id', ParseIntPipe) id: number) {
		await this.diagnosticTypesService.remove(id);
	}
}