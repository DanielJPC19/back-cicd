import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
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

	@Column({ nullable: true, unique: false })
		address: string;

	@Column({ nullable: false, unique: false , default: false})
		isDeleted: boolean;

	@Column({ nullable: true, unique: false })
		profilePicture: string;

  	@CreateDateColumn({ type: 'timestamp' })
  		createdAt: Date;

  	@UpdateDateColumn({ type: 'timestamp' })	
  		updatedAt: Date;


  	@DeleteDateColumn()
  		deletedAt?: Date;
		
	@ManyToOne(() => Role,(role) => role.users, {eager: true})
	@JoinColumn({name: 'role_id'})
		role: Role
	
}



