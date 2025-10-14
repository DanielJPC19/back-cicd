import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Pet } from '../../../clinic/pets/entities/pet.entity';

@Entity('species')
export class Species {
	@PrimaryGeneratedColumn()
		id: number;

	@Column({ unique: true, nullable: false })
		name: string;

	@Column({ nullable: true })
		description: string;

	@Column({ nullable: false, unique: false, default: false })
		isDeleted: boolean;

	@CreateDateColumn({ type: 'timestamp' })
		createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
		updatedAt: Date;

	@DeleteDateColumn()
		deletedAt: Date;

	@OneToMany(() => Pet, (pet) => pet.species)
		pets: Pet[];
}