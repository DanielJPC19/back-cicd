
import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from '../decorators/permissions.decorator';
import { AddPermissionDto } from '../dto/add-permissionToRole.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesService } from './roles.service';


@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('roles')
export class RolesController {
	constructor(
		private readonly roleService: RolesService

	){}

	@Permissions('role_create')
	@Post()	
	async create(@Body() createRoleDto: CreateRoleDto) {
		const result = await this.roleService.create(createRoleDto);
		return result;
	}
	/* 	@Get()
	async findAll() {
		const result = await this.roleService.findAll();
		return result;
	} */

	@Permissions('role_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.roleService.findOne(id);
		return result;
	}

	@Permissions('role_update')
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateRoleDto: UpdateRoleDto,
	) {
		const result = await this.roleService.update(id, updateRoleDto);
		return result;
	}

	@Permissions('role_delete')
	@Delete(':id')
	@HttpCode(204)
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.roleService.removeById(id);
	}

	@Permissions('role_add_permission')
	@Post('permission')
	addPermission(@Body() addPermissionDto: AddPermissionDto) {
		return this.roleService.addPermission(addPermissionDto);

	}
}
