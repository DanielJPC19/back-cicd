import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from '../decorators/permissions.decorator';
import { AddRoleDto } from '../dto/add-roleToUser.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PermissionsGuard } from '../guards/permissions.guard';
import { UsersService } from './users.service';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {


	constructor(
		private readonly userService: UsersService

	){}


    @Permissions('user_create')
	@Post()	
	async create(@Body() createUserDto: CreateUserDto) {
		const result = await this.userService.create(createUserDto);
		return result;
	}
	

	@Get()

    @Permissions('user_read')
    async findAll() {
    	const result = await this.userService.findAll();
    	return result;
    }


    @Permissions('user_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.userService.findOne(id);
		return result;
	}


    @Permissions('user_update')
	@Patch(':id')
    async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
    ) {
    	const result = await this.userService.update(id, updateUserDto);
    	return result;
    }


    @Permissions('user_delete')
	@Delete(':id')
	@HttpCode(204)
    async removeById(@Param('id', ParseIntPipe) id: number) {
    	await this.userService.removeById(id);
    }


    @Permissions('user_add_role')
	@Post('role')
    async addOrSetRole(@Body() addRoleDto:AddRoleDto){
    	return this.userService.addOrSetRole(addRoleDto)

    }

}
