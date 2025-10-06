
import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AddPermissionDto } from '../dto/add-permissionToRole.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RolesService } from './roles.service';


@Controller('roles')
export class RolesController {
	constructor(
		private readonly roleService: RolesService

	){}

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

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.roleService.findOne(id);
		return result;
	}

	@Get(':roleName')
	async findByName(@Param('roleName') roleName: string) {
		const result = await this.roleService.findByName(roleName);
		return result;
	}

	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateRoleDto: UpdateRoleDto,
	) {
		const result = await this.roleService.update(id, updateRoleDto);
		return result;
	}

	@Delete(':id')
	@HttpCode(204)
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.roleService.removeById(id);
	}

	@Post('permission')
	addPermission(@Body() addPermissionDto: AddPermissionDto) {
		return this.roleService.addPermission(addPermissionDto);

	}
}
