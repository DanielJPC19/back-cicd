import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../core/auth/entities/user.entity';
import { DiagnosticType } from '../../diagnostic-types/entities/diagnostic-type.entity';
import { Diagnostic } from '../../diagnostics/entities/diagnostic.entity';
import { Pet } from '../../pets/entities/pet.entity';

export enum MedicalRecordStatus {
	SCHEDULED = 'scheduled',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled'
}

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

	@ManyToOne(() => DiagnosticType, { eager: true, nullable: false })
	@JoinColumn({ name: 'diagnostic_type_id' })
		type: DiagnosticType;

	@Column({ type: 'enum', enum: MedicalRecordStatus, nullable: false, default: MedicalRecordStatus.SCHEDULED })
		status: MedicalRecordStatus;

	@Column({ type: 'date', nullable: false })
		visitDate: Date;

	@Column({ type: 'text', nullable: false })
		reason: string;

	@Column({ type: 'text', nullable: true })
		symptoms: string;

	@Column({ type: 'text', nullable: true })
		examination: string;

	@Column({ type: 'text', nullable: true })
		treatment: string;

	@Column({ type: 'text', nullable: true })
		prescription: string;

	@Column({ type: 'text', nullable: true })
		notes: string;

	@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
		weight: number;

	@Column({ type: 'enum', enum: PetSize, nullable: true })
		size: PetSize;

	@Column({ type: 'text', nullable: true })
		allergies: string;

	@Column({ type: 'text', nullable: true })
		medications: string;

	@Column({ type: 'text', nullable: true })
		specialNotes: string;

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