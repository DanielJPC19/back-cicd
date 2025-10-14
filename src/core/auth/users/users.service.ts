import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../../../common/dto';
import { Repository } from 'typeorm';
import { UserConflict, UserNotFoundException } from '../../../common/exceptions';
import { CreateUserDto } from '../dto/create-user.dto';
import { SetUserRoleDto } from '../dto/update-user-role.dto';
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
		
		const defaultRole = await this.roleService.findByName('user')
		const newUser = this.userRepository.create({
			... createUserDto,
			role: defaultRole
		})
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

    	const user = await this.userRepository.findOne({
			where: { id },
			relations: ['role', 'role.permissions']
		})
		
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

	async setUserRole(id: number,setUserRoleDto:SetUserRoleDto):Promise<void>{

    	const user = await this.findOne(id)

    	if(!user) throw new UserNotFoundException(id)

    	const role = await this.roleService.findOne(setUserRoleDto.roleId)

    	user.role = role

    	await this.userRepository.save(user)

    	return
		
	}




	async findAll(paginationDto:PaginationDto){

		const {page, limit} = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await this.userRepository.findAndCount({
			skip,
			take: limit,
			order: {id: 'ASC'}
		})

		return {

			data, total, page, limit,
			totalPages: Math.ceil(total/limit),
			hasNextPage: page * limit < total,
			hasPrevPage: page> 1,


		}


	}

	





}
