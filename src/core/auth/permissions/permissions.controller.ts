import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { PermissionsService } from './permissions.service';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
	constructor(
		private readonly permissionService: PermissionsService

	){}

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

	@Permissions('permission_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.permissionService.findOne(id);
		return result;
	}


	@Permissions('permission_update')
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePermissionDto: UpdatePermissionDto,
	) {
		const result = await this.permissionService.update(id, updatePermissionDto);
		return result;
	}

	@Permissions('permission_delete')
	@Delete(':id')
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.permissionService.removeById(id);
	}

}
