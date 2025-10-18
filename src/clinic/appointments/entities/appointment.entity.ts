import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../core/auth/entities/user.entity';
import { Diagnostic } from '../../diagnostics/entities/diagnostic.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { Schedule } from './schedule.entity';

export enum AppointmentStatus {
	SCHEDULED = 'scheduled',
	CONFIRMED = 'confirmed',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
	NO_SHOW = 'no_show'
}

export enum AppointmentType {
	CONSULTATION = 'consultation',
	VACCINATION = 'vaccination',
	SURGERY = 'surgery',
	GROOMING = 'grooming',
	EMERGENCY = 'emergency',
	FOLLOW_UP = 'follow_up'
}

@Entity('appointments')
export class Appointment {
	@PrimaryGeneratedColumn()
		id: number;

	@Column({ type: 'timestamp', nullable: false })
		appointmentDate: Date;

	@Column({ type: 'time', nullable: false })
		startTime: string;

	@Column({ type: 'time', nullable: false })
		endTime: string;

	@Column({ type: 'enum', enum: AppointmentStatus, nullable: false, default: AppointmentStatus.SCHEDULED })
		status: AppointmentStatus;

	@Column({ type: 'enum', enum: AppointmentType, nullable: false })
		type: AppointmentType;

	@Column({ type: 'text', nullable: true })
		notes: string;

	@Column({ type: 'text', nullable: true })
		reason: string;

	@Column({ nullable: true, unique: false })
		googleCalendarEventId: string;

	@Column({ nullable: false, unique: false, default: false })
		isDeleted: boolean;

	@CreateDateColumn({ type: 'timestamp' })
		createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
		updatedAt: Date;

	@DeleteDateColumn()
		deletedAt: Date;

	@ManyToOne(() => User, { eager: true })
	@JoinColumn({ name: 'veterinarian_id' })
		veterinarian: User;

	@ManyToOne(() => Pet, { eager: true })
	@JoinColumn({ name: 'pet_id' })
		pet: Pet;

	@ManyToOne(() => Diagnostic, { nullable: true })
	@JoinColumn({ name: 'diagnostic_id' })
		diagnostic: Diagnostic;

	@ManyToOne(() => Schedule, (schedule) => schedule.appointments, { eager: true })
	@JoinColumn({ name: 'schedule_id' })
		schedule: Schedule;
}
