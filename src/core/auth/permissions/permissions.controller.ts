import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../decorators/permissions.decorator';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionsGuard } from '../guards/permissions.guard';
import { PermissionsService } from './permissions.service';

@ApiBearerAuth('jwt-auth')
@ApiTags('Permissions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
	constructor(
		private readonly permissionService: PermissionsService

	){}

	@ApiOperation({ summary: 'Crear un nuevo permiso' })
	@ApiBody({ type: CreatePermissionDto })
	@ApiResponse({ status: 201, description: 'Permiso creado correctamente.' })	  
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
	@ApiResponse({ status: 409, description: 'Conflicto — el permiso ya existe.' })
	@Permissions('permission_create')
	@Post()	
	async create(@Body() createPermissionDto: CreatePermissionDto) {
		const result = await this.permissionService.create(createPermissionDto);
		return result;
	}
	/* 	@Get()
	async findAll() {
		const result = await this.permissionService.findAll();
		return result;
	} */
	@ApiOperation({ summary: 'Obtener un permiso por su ID' })
	@ApiResponse({ status: 200, description: 'Permiso obtenido correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
	@ApiResponse({ status: 404, description: 'Permiso no encontrado.' })
	@Permissions('permission_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.permissionService.findOne(id);
		return result;
	}

	@ApiOperation({ summary: 'Actualizar un permiso existente' })
	@ApiBody({ type: UpdatePermissionDto })
	@ApiResponse({ status: 200, description: 'Permiso actualizado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
	@ApiResponse({ status: 404, description: 'Permiso no encontrado.' })
	@Permissions('permission_update')
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePermissionDto: UpdatePermissionDto,
	) {
		const result = await this.permissionService.update(id, updatePermissionDto);
		return result;
	}
	@ApiOperation({ summary: 'Eliminar un permiso por su ID' })
	@ApiResponse({ status: 204, description: 'Permiso eliminado correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
	@ApiResponse({ status: 404, description: 'Permiso no encontrado.' })
	@Permissions('permission_delete')
	@Delete(':id')
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.permissionService.removeById(id);
	}

}
