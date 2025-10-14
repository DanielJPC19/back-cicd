import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Species } from '../../../catalogs/species/entities/species.entity';
import { User } from '../../../core/auth/entities/user.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';

export enum PetGender {
	MALE = 'male',
	FEMALE = 'female'
}


@Entity('pets')
export class Pet {
	@PrimaryGeneratedColumn()
		id: number;

	@Column({ nullable: false, unique: false })
		name: string;

	@Column({ type: 'enum', enum: PetGender, nullable: false })
		gender: PetGender;

	@ManyToOne(() => Species, (species) => species.pets, { eager: true })
	@JoinColumn({ name: 'species_id' })
		species: Species;

	@Column({ nullable: false, unique: false })
		breed: string;

	@Column({ type: 'date', nullable: false })
		birthDate: Date;

	@Column({ nullable: true, unique: false })
		color: string;

	@Column({ nullable: false, unique: false, default: false })
		isDeleted: boolean;

	@Column({ nullable: true, unique: false })
		profilePicture: string;

	@CreateDateColumn({ type: 'timestamp' })
		createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
		updatedAt: Date;

	@DeleteDateColumn()
		deletedAt: Date;

	@ManyToOne(() => User, { eager: true })
	@JoinColumn({ name: 'owner_id' })
		owner: User;

	@OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.pet)
		medicalRecords: MedicalRecord[];
}