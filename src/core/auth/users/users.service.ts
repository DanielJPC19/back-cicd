import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	){}
	
	async create():Promise<void>{


	}


	async findOne():Promise<void>{

	}


	async update():Promise<void>{

	}


	async remove():Promise<void>{

	}


	async findAll():Promise<void>{

	}





}
