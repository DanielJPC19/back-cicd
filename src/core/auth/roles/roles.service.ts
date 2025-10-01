import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {

	constructor(

		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>

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
