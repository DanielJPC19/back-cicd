
import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto';
import { Permissions } from '../decorators/permissions.decorator';
import { AddPermissionDto } from '../dto/add-permissionToRole.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesService } from './roles.service';

@ApiBearerAuth('jwt-auth')
@ApiTags('Roles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('roles')
export class RolesController {
	constructor(
		private readonly roleService: RolesService

	){}
	@ApiOperation({ summary: 'Crear un rol' })
	@ApiBody({ type: CreateRoleDto })
	@ApiResponse({ status: 201, description: 'Rol creado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 409, description: 'Conflicto, ya existe un rol con ese nombre.' })
	@Permissions('role_create')
	@Post()	
	async create(@Body() createRoleDto: CreateRoleDto) {
		const result = await this.roleService.create(createRoleDto);
		return result;
	}
	@ApiOperation({ summary: 'Obtener un rol por ID' })
	@ApiResponse({ status: 200, description: 'Rol encontrado correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado.' })
	@Permissions('role_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.roleService.findOne(id);
		return result;
	}

	@ApiOperation({ summary: 'Actualizar un rol' })
	@ApiBody({ type: UpdateRoleDto })
	@ApiResponse({ status: 200, description: 'Rol actualizado correctamente.' })
 	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado.' })
	@Permissions('role_update')
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateRoleDto: UpdateRoleDto,
	) {
		const result = await this.roleService.update(id, updateRoleDto);
		return result;
	}

	@ApiOperation({ summary: 'Eliminar un rol' })
	@ApiResponse({ status: 204, description: 'Rol eliminado correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado.' })
	@Permissions('role_delete')
	@Delete(':id')
	@HttpCode(204)
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.roleService.removeById(id);
	}

	@ApiOperation({ summary: 'Agregar permisos a un rol' })
	@ApiBody({ type: AddPermissionDto })
	@ApiResponse({ status: 200, description: 'Permisos agregados correctamente al rol.' })
  	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Rol o permisos no encontrados.' })
	@Permissions('role_add_permission')
	@HttpCode(200)
	@Post('permission')
	addPermission(@Body() addPermissionDto: AddPermissionDto) {
		return this.roleService.addPermission(addPermissionDto);

	}


	@Get()
	@ApiOperation({ summary: 'Listar todos los Roles' })
	@ApiResponse({ status: 200, description: 'Lista de Roles obtenida correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
    @Permissions('role_read')
	async findAll(@Query() paginationDto: PaginationDto) {
		const result = await this.roleService.findAll(paginationDto);
		return result;
	}

}
