import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticTypesModule } from '../../catalogs/diagnostic-types/diagnostic-types.module';
import { AuthModule } from '../../core/auth/auth.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { Diagnostic } from './entities/diagnostic.entity';

@Module({
  controllers: [DiagnosticsController],
  providers: [DiagnosticsService],
  imports: [
    TypeOrmModule.forFeature([Diagnostic]),
    MedicalRecordsModule,
    DiagnosticTypesModule,
    AuthModule,
  ],
  exports: [DiagnosticsService],
})
export class DiagnosticsModule {}