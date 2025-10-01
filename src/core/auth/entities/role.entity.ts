import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from './permission.entity';
import { User } from "./user.entity";



@Entity('roles')
export class Role {

	@PrimaryGeneratedColumn()
		id: number
	
	@Column({nullable: false, unique: false})
		roleName: string

	@Column({nullable: false, unique: false})
		description: string
			
	@OneToMany(() => User, (user) => user.role)
		users: User[]


	@ManyToMany(() => Permission, { eager: true })
	@JoinTable({
		name: 'roles_permissions',
		joinColumn: { name: 'rol_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
	})
		permissions: Permission[];



}
