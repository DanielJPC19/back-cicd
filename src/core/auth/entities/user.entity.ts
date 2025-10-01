import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';


@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
		id: number;

	@Column({ nullable: false, unique: true })
		email: string;

	@Column({ nullable: false, unique: false })
		fistName: string;

	@Column({ nullable: false, unique: false })
		lastName: string;

	@Column({ nullable: false, unique: false })
		password: string;

	@Column({ nullable: false, unique: false })
		phoneNumber: string;

	@Column({ nullable: false, unique: false })
		address: string;

	@Column({ nullable: false, unique: false })
		isDeleted: boolean;

	@Column({ nullable: false, unique: false })
		profilePicture: string;

	@Column({ nullable: false, unique: false })
		createdAt: Date;

	@Column({ nullable: false, unique: false })
		updatedAt: Date;

	@ManyToOne(() => Role,(role) => role.users, {eager: true})
	@JoinColumn({name: 'role_id'})
		role: Role
	
}



