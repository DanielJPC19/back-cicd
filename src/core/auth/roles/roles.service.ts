import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionNotFoundException, RoleConflict, RoleNotFoundException } from '../../../common/exceptions';
import { AddPermissionDto } from '../dto/add-permissionToRole.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../entities/role.entity';
import { PermissionsService } from '../permissions/permissions.service';
import {PaginationDto}  from '../../../common/dto';

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


	async addPermission(addPermissionDto:AddPermissionDto):Promise<void>{


		const role = await this.findOne(addPermissionDto.roleId)		
		if(!role) throw new RoleNotFoundException(addPermissionDto.roleId)

		const permission = await this.permissionService.findOne(addPermissionDto.permissionId)		
		if(!permission) throw new PermissionNotFoundException(addPermissionDto.permissionId)
		
		if (!role.permissions.some(p => p.id === permission.id)) {
			role.permissions.push(permission);
			await this.roleRepository.save(role);
		}
		return 

	}




	async findAll(paginationDto:PaginationDto){

		const {page, limit} = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await this.roleRepository.findAndCount({
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
