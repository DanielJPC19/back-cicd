import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../core/auth/entities/user.entity';
import { Diagnostic } from '../../diagnostics/entities/diagnostic.entity';
import { Pet } from '../../pets/entities/pet.entity';

export enum PetSize {
	SMALL = 'small',
	MEDIUM = 'medium', 
	LARGE = 'large',
	EXTRA_LARGE = 'extra_large'
}

@Entity('medical_records')
export class MedicalRecord {
	@PrimaryGeneratedColumn()
		id: number;

	@Column({ type: 'date', nullable: false })
		openingDate: Date;

	@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
		weight: number;

	@Column({ type: 'enum', enum: PetSize, nullable: true })
		size: PetSize;

	@Column({ type: 'text', nullable: true })
		allergies: string;

	@Column({ type: 'text', nullable: true })
		medications: string;

	@Column({ type: 'text', nullable: true })
		vaccinationStatus: string;

	@Column({ nullable: false, unique: false, default: false })
		isDeleted: boolean;

	@CreateDateColumn({ type: 'timestamp' })
		createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
		updatedAt: Date;

	@DeleteDateColumn()
		deletedAt: Date;

	@ManyToOne(() => Pet, (pet) => pet.medicalRecords, { eager: true })
	@JoinColumn({ name: 'pet_id' })
		pet: Pet;

	@ManyToOne(() => User, { eager: true })
	@JoinColumn({ name: 'veterinarian_id' })
		veterinarian: User;

	@OneToMany(() => Diagnostic, (diagnostic) => diagnostic.medicalRecord)
		diagnostics: Diagnostic[];
}