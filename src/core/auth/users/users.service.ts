import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserConflict } from 'src/common/exceptions/user-conflict.exception';
import { UserNotFoundException } from 'src/common/exceptions';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	){}
	
	async create(createUserDto:CreateUserDto):Promise<User>{

		const exists = await this.userRepository.exists({

			where:{email:createUserDto.email}
		})

		if(exists) throw new UserConflict(createUserDto.email)

		const newUser = this.userRepository.create(createUserDto)
		const savedUser = await this.userRepository.save(newUser)
			

		return savedUser

	}


	async findByEmail(email: string):Promise<User>{

		const user = await this.userRepository.findOneBy({email: email})
		
		if(!user) throw new UserNotFoundException(email)

			
		return user
	}


	async findOne(id:number):Promise<User>{

		const user = await this.userRepository.findOneBy({id})
		
		if(!user) throw new UserNotFoundException(id)

			
		return user
	}


	async update(id:number,updateUserDto:UpdateUserDto):Promise<User>{

		const exists = await this.userRepository.exists({
			where:{email:updateUserDto.email}
		})

		if(exists) throw new UserConflict(updateUserDto.email)

		const result = await this.userRepository.update(id,updateUserDto)

		if(!result.affected) throw new UserNotFoundException(id)

		return this.findOne(id)


	}



	async removeById(id: number): Promise<void> {

		const result = await this.userRepository.softDelete(id)
		if(!result.affected) throw new UserNotFoundException(id)
		
		return


	}

	async removeByEmail(email: string): Promise<void>{

		const result = await this.userRepository.softDelete({ email: email })
		if(!result.affected) throw new UserNotFoundException(email)
		
		return

	}




	async findAll():Promise<void>{

	}




}
