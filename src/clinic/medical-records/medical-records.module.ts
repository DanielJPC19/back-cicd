import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../core/auth/auth.module';
import { DiagnosticTypesModule } from '../diagnostic-types/diagnostic-types.module';
import { PetsModule } from '../pets/pets.module';
import { MedicalRecord } from './entities/medical-record.entity';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';

@Module({
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  imports: [
    TypeOrmModule.forFeature([MedicalRecord]),
    PetsModule,
    DiagnosticTypesModule,
    AuthModule,
  ],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}