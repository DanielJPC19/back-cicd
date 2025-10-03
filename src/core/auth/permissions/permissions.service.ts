import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionNotFoundException } from 'src/common/exceptions';
import { PermissionConflict } from 'src/common/exceptions/permission-conflict.exception';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {

	constructor(
		@InjectRepository(Permission)
		private readonly permissionRepository: Repository<Permission>
	){}


	async create(createPermissionDto:CreatePermissionDto): Promise<Permission> {

		
		const exists = await this.permissionRepository.exists({
			where:{permissionName: createPermissionDto.permissionName}
		})		

		if(exists) throw new ConflictException()

		const newPermission: Permission = this.permissionRepository.create(createPermissionDto)

		const savedPermission = await this.permissionRepository.save(newPermission)

		return	savedPermission 

	}


	async findByName(permissionName: string): Promise<Permission> {

		const permission: Permission | null = await this.permissionRepository.findOneBy({permissionName:permissionName})

		if(!permission) throw new PermissionNotFoundException(permissionName)
		
		return	permission 

	}



	async findOne(id:number): Promise<Permission> {
		const permission: Permission | null = await this.permissionRepository.findOneBy({id})
		
		if(!permission) throw new PermissionNotFoundException(id)
	
		return permission 	
	}


	async update(id: number, updatePermissionDto:UpdatePermissionDto): Promise<Permission> {


		const exists = await this.permissionRepository.exists({
			where:{permissionName: updatePermissionDto.permissionName}
		})

		if(exists) throw new PermissionConflict(updatePermissionDto.permissionName)

		const result = await this.permissionRepository.update(id,updatePermissionDto)

		if(!result.affected) throw new PermissionNotFoundException(id)
		
		return this.findOne(id)

	}

	async removeById(id: number): Promise<void> {

		const result = await this.permissionRepository.softDelete(id)
		if(!result.affected) throw new PermissionNotFoundException(id)
		
		return


	}

	async removeByName(permissionName: string): Promise<void>{

		const result = await this.permissionRepository.softDelete({permissionName:permissionName})
		if(!result.affected) throw new PermissionNotFoundException(permissionName)
		
		return

	}

	/* 	async findAll(): Promise<Permission> {


	} */






}
