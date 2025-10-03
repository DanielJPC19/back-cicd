import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

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
	/* 	@Get()
	async findAll() {
		const result = await this.userService.findAll();
		return result;
	} */

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


	@Delete(':email')
	@HttpCode(204)
	async removeByEmail(@Param('email') email: string) {
		await this.userService.removeByEmail(email);
	}




}
