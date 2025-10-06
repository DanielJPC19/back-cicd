import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RoleNotFoundException, UserNotFoundException } from 'src/common/exceptions';
import { UserConflict } from 'src/common/exceptions/user-conflict.exception';
import { Repository } from 'typeorm';
import { AddRoleDto } from '../dto/add-roleToUser.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly roleService: RolesService
	){}
	
	async create(createUserDto:CreateUserDto):Promise<User>{

		const exists = await this.userRepository.exists({

			where:{email:createUserDto.email}
		})

		if(exists) throw new UserConflict(createUserDto.email)

		createUserDto.password = await bcrypt.hash(createUserDto.password,10)
		

		const newUser = this.userRepository.create(createUserDto)
		const savedUser = await this.userRepository.save(newUser)
			

		return savedUser

	}


	async findByEmail(email: string):Promise<User>{

		const user = await this.userRepository.findOne({
			where: { email },
			relations: ['role', 'role.permissions'],
		})
		
		if(!user) throw new UserNotFoundException(email)

			
		return user
	}


	async findOne(id:number):Promise<User>{

		const user = await this.userRepository.findOneBy({id})
		
		if(!user) throw new UserNotFoundException(id)

			
		return user
	}


	async update(id:number,updateUserDto:UpdateUserDto):Promise<User>{

		const result = await this.userRepository.update(id,updateUserDto)

		if(!result.affected) throw new UserNotFoundException(id)

		return this.findOne(id)


	}



	async removeById(id: number): Promise<void> {

		const result = await this.userRepository.softDelete({id})
		if(!result.affected) throw new UserNotFoundException(id)
		
		return


	}

	async addOrSetRole(addRoleDto:AddRoleDto):Promise<void>{

		const user = await this.findOne(addRoleDto.userId)

		if(!user) throw new UserNotFoundException(addRoleDto.userId)

		const role = await this.roleService.findOne(addRoleDto.roleId)

		if(!role) throw new RoleNotFoundException(addRoleDto.roleId)
	
		user.role = role

		await this.userRepository.save(user)

		return
		
	}




	async findAll():Promise<User[]>{

		return this.userRepository.find()

	}




}
