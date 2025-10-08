import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Permissions } from '../decorators/permissions.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { SetUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PermissionsGuard } from '../guards/permissions.guard';
import { UsersService } from './users.service';

@ApiBearerAuth('jwt-auth')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {


	constructor(
		private readonly userService: UsersService

	){}

	@ApiOperation({ summary: 'Crear un usuario' })
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({ status: 201, description: 'Usuario creado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 409, description: 'Conflicto, ya existe un usuario con ese email.' })
    @Permissions('user_create')
	@Post()	
	async create(@Body() createUserDto: CreateUserDto) {
		const result = await this.userService.create(createUserDto);
		return result;
	}
	

	@Get()
	@ApiOperation({ summary: 'Listar todos los usuarios' })
	@ApiResponse({ status: 200, description: 'Lista de usuarios obtenida correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
    @Permissions('user_read')
	async findAll() {
    	const result = await this.userService.findAll();
    	return result;
	}

	@ApiOperation({ summary: 'Obtener un usuario por ID' })
	@ApiResponse({ status: 200, description: 'Usuario obtenido correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
    @Permissions('user_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.userService.findOne(id);
		return result;
	}

	@ApiOperation({ summary: 'Actualizar un usuario' })
	@ApiBody({ type: UpdateUserDto })
	@ApiResponse({ status: 200, description: 'Usuario actualizado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
    @Permissions('user_update')
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
    	const result = await this.userService.update(id, updateUserDto);
    	return result;
	}

	@ApiOperation({ summary: 'Eliminar un usuario' })
	@ApiResponse({ status: 204, description: 'Usuario eliminado correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
    @Permissions('user_delete')
	@Delete(':id')
	@HttpCode(204)
	async removeById(@Param('id', ParseIntPipe) id: number) {
    	await this.userService.removeById(id);
	}
	
	
	@ApiOperation({ summary: 'Asignar o cambiar rol de un usuario' })
	@ApiBody({ type: SetUserRoleDto })
	@ApiResponse({ status: 200, description: 'Rol asignado/cambiado correctamente.' })	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Usuario o rol no encontrado.' })
 	@Permissions('user_add_role')
	@Patch(':id/role')
	async setUserRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() setUserRoleDto: SetUserRoleDto
	) {
		return this.userService.setUserRole(id, setUserRoleDto);
	}

}
