import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"


@Entity('permissions')
export class Permission {


	@PrimaryGeneratedColumn()
		id: number
	
	@Column({nullable: false, unique: true})
		permissionName: string


  	@CreateDateColumn({ type: 'timestamp' })
  		createdAt: Date;

  	@UpdateDateColumn({ type: 'timestamp' })	
  		updatedAt: Date;


  	@DeleteDateColumn()
  		deletedAt?: Date;

}
