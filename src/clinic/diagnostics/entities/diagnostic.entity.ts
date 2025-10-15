import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DiagnosticType } from '../../../catalogs/diagnostic-types/entities/diagnostic-type.entity';
import { User } from '../../../core/auth/entities/user.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';

export enum DiagnosticSeverity {
	LOW = 'low',
	MODERATE = 'moderate',
	HIGH = 'high',
	CRITICAL = 'critical'
}

@Entity('diagnostics')
export class Diagnostic {
	@PrimaryGeneratedColumn()
		id: number;

	@ManyToOne(() => DiagnosticType, (diagnosticType) => diagnosticType.diagnostics, { eager: true })
	@JoinColumn({ name: 'diagnostic_type_id' })
		type: DiagnosticType;

	@Column({ type: 'date', nullable: false })
		visitDate: Date;

	@Column({ type: 'text', nullable: false })
		reason: string;

	@Column({ type: 'text', nullable: true })
		symptoms: string;

		//esto seria como los hallazgos del diagnostico
	@Column({ type: 'text', nullable: true })
		examination: string;

	@Column({ type: 'enum', enum: DiagnosticSeverity, nullable: false })
		severity: DiagnosticSeverity;

	@Column({ type: 'text', nullable: true })
		recommendations: string;

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