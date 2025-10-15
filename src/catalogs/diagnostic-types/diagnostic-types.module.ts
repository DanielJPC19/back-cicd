import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../core/auth/auth.module';
import { DiagnosticTypesController } from './diagnostic-types.controller';
import { DiagnosticTypesService } from './diagnostic-types.service';
import { DiagnosticType } from './entities/diagnostic-type.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([DiagnosticType]),
		AuthModule
	],
	controllers: [DiagnosticTypesController],
	providers: [DiagnosticTypesService],
	exports: [DiagnosticTypesService, TypeOrmModule],
})
export class DiagnosticTypesModule {}