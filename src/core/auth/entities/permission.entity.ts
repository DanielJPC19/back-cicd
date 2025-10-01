import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"


@Entity('permissions')
export class Permission {


	@PrimaryGeneratedColumn()
		id: number
	
	@Column({nullable: false, unique: true})
		permissionName: string



}
