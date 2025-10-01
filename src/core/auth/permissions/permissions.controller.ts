import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { PermissionsService } from './permissions.service';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Controller('permissions')
export class PermissionsController {
	constructor(
		private readonly permissionService: PermissionsService

	){}

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

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.permissionService.findOne(id);
		return result;
	}

	@Get(':permissionName')
	async findByName(@Param('permissionName') permissionName: string) {
		const result = await this.permissionService.findByName(permissionName);
		return result;
	}

	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePermissionDto: UpdatePermissionDto,
	) {
		const result = await this.permissionService.update(id, updatePermissionDto);
		return result;
	}

	@Delete(':id')
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.permissionService.removeById(id);
	}


	@Delete(':permissionName')
	async removeByName(@Param('permissionName') permissionName: string) {
		await this.permissionService.removeByName(permissionName);
	}

}
