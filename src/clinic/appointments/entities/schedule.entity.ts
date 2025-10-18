import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../core/auth/entities/user.entity';
import { Appointment } from './appointment.entity';

export enum ScheduleStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	PAUSED = 'paused'
}

@Entity('schedules')
export class Schedule {
	@PrimaryGeneratedColumn()
		id: number;

	@Column({ nullable: false, unique: false })
		name: string;

	@Column({ type: 'text', nullable: true })
		description: string;

	@Column({ type: 'time', nullable: false })
		startTime: string;

	@Column({ type: 'time', nullable: false })
		endTime: string;

	@Column({ type: 'json', nullable: true })
		daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.

	@Column({ type: 'date', nullable: true })
		startDate: Date;

	@Column({ type: 'date', nullable: true })
		endDate: Date;

	@Column({ type: 'int', nullable: false, default: 30 })
		appointmentDuration: number; // in minutes

	@Column({ type: 'int', nullable: false, default: 0 })
		breakDuration: number; // in minutes between appointments

	@Column({ type: 'enum', enum: ScheduleStatus, nullable: false, default: ScheduleStatus.ACTIVE })
		status: ScheduleStatus;

	@Column({ nullable: false, unique: false, default: false })
		isDeleted: boolean;

	@CreateDateColumn({ type: 'timestamp' })
		createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
		updatedAt: Date;

	@DeleteDateColumn()
		deletedAt: Date;

	@ManyToOne(() => User, { eager: true })
	@JoinColumn({ name: 'user_id' })
		user: User;

	@OneToMany(() => Appointment, (appointment) => appointment.schedule)
		appointments: Appointment[];
}
