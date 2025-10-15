import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Diagnostic } from '../../../clinic/diagnostics/entities/diagnostic.entity';

@Entity('diagnostic_types')
export class DiagnosticType {
	@PrimaryGeneratedColumn()
		id: number;

	@Column({ unique: true, nullable: false })
		name: string;

	@Column({ nullable: false, unique: false, default: false })
		isDeleted: boolean;

	@CreateDateColumn({ type: 'timestamp' })
		createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
		updatedAt: Date;

	@DeleteDateColumn()
		deletedAt: Date;

	@OneToMany(() => Diagnostic, (diagnostic) => diagnostic.type)
		diagnostics: Diagnostic[];
}