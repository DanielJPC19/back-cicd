import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../core/auth/entities/user.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';

export enum DiagnosticSeverity {
	LOW = 'low',
	MODERATE = 'moderate',
	HIGH = 'high',
	CRITICAL = 'critical'
}

export enum DiagnosticStatus {
	PRELIMINARY = 'preliminary',
	CONFIRMED = 'confirmed',
	RULED_OUT = 'ruled_out',
	UNDER_INVESTIGATION = 'under_investigation'
}

@Entity('diagnostics')
export class Diagnostic {
	@PrimaryGeneratedColumn()
		id: number;

	@Column({ nullable: false, unique: false })
		condition: string;

	@Column({ type: 'text', nullable: true })
		description: string;

	@Column({ type: 'enum', enum: DiagnosticSeverity, nullable: false })
		severity: DiagnosticSeverity;

	@Column({ type: 'enum', enum: DiagnosticStatus, nullable: false, default: DiagnosticStatus.PRELIMINARY })
		status: DiagnosticStatus;

	@Column({ type: 'text', nullable: true })
		recommendations: string;

	@Column({ type: 'text', nullable: true })
		followUpInstructions: string;

	@Column({ type: 'date', nullable: true })
		followUpDate: Date;

	@Column({ type: 'text', nullable: true })
		notes: string;

	@Column({ nullable: false, unique: false, default: false })
		isDeleted: boolean;

	@CreateDateColumn({ type: 'timestamp' })
		createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
		updatedAt: Date;

	@DeleteDateColumn()
		deletedAt: Date;

	@ManyToOne(() => MedicalRecord, (medicalRecord) => medicalRecord.diagnostics, { eager: true })
	@JoinColumn({ name: 'medical_record_id' })
		medicalRecord: MedicalRecord;

	@ManyToOne(() => User, { eager: true })
	@JoinColumn({ name: 'veterinarian_id' })
		veterinarian: User;
}