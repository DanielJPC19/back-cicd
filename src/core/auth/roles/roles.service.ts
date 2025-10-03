import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleConflict } from 'src/common/exceptions/role-conflict.exception';
import { RoleNotFoundException } from 'src/common/exceptions';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {

	constructor(

		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>,
		private readonly permissionService: PermissionsService
		
	){}


	async create(createRoleDto:CreateRoleDto):Promise<Role>{

		const exists = await this.roleRepository.exists({

			where:{roleName:createRoleDto.roleName}
		})

		if(exists) throw new RoleConflict(createRoleDto.roleName)

		const newRole = this.roleRepository.create(createRoleDto)
		const savedRole = await this.roleRepository.save(newRole)
			

		return savedRole

	}


	async findByName(roleName: string):Promise<Role>{

		const role = await this.roleRepository.findOneBy({roleName: roleName})
		
		if(!role) throw new RoleNotFoundException(roleName)

			
		return role
	}


	async findOne(id:number):Promise<Role>{

		const role = await this.roleRepository.findOneBy({id})
		
		if(!role) throw new RoleNotFoundException(id)

			
		return role
	}


	async update(id:number,updateRoleDto:UpdateRoleDto):Promise<Role>{

		const exists = await this.roleRepository.exists({
			where:{roleName:updateRoleDto.roleName}
		})

		if(exists) throw new RoleConflict(updateRoleDto.roleName)

		const result = await this.roleRepository.update(id,updateRoleDto)

		if(!result.affected) throw new RoleNotFoundException(id)

		return this.findOne(id)


	}



	async removeById(id: number): Promise<void> {

		const result = await this.roleRepository.softDelete(id)
		if(!result.affected) throw new RoleNotFoundException(id)
		
		return


	}

	async removeByName(roleName: string): Promise<void>{

		const result = await this.roleRepository.softDelete({roleName: roleName})
		if(!result.affected) throw new RoleNotFoundException(roleName)
		
		return

	}




	async findAll():Promise<void>{

	}



}
