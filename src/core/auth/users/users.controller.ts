import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AddRoleDto } from '../dto/add-roleToUser.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';

@Controller('users')
export class UsersController {


	constructor(
		private readonly userService: UsersService

	){}

	@Post()	
	async create(@Body() createUserDto: CreateUserDto) {
		const result = await this.userService.create(createUserDto);
		return result;
	}
	

	@Get()
	@UseGuards(AuthGuard('jwt'), PermissionsGuard)
    @Permissions('Updated Permission 1')
	async findAll() {
		const result = await this.userService.findAll();
		return result;
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.userService.findOne(id);
		return result;
	}

	@Get(':email')
	async findByEmail(@Param('email') email: string) {
		const result = await this.userService.findByEmail(email);
		return result;
	}

	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		const result = await this.userService.update(id, updateUserDto);
		return result;
	}

	@Delete(':id')
	@HttpCode(204)
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.userService.removeById(id);
	}


	@Post('role')
	async addOrSetRole(@Body() addRoleDto:AddRoleDto){
		return this.userService.addOrSetRole(addRoleDto)

	}

}
