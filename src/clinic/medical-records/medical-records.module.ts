import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../core/auth/entities/permission.entity';
import { Role } from '../../core/auth/entities/role.entity';
import { User } from '../../core/auth/entities/user.entity';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { RolesService } from '../../core/auth/roles/roles.service';
import { UsersService } from '../../core/auth/users/users.service';
import { DiagnosticTypesModule } from '../diagnostic-types/diagnostic-types.module';
import { PetsModule } from '../pets/pets.module';
import { MedicalRecord } from './entities/medical-record.entity';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';

@Module({
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, UsersService, RolesService, PermissionsGuard],
  imports: [
    TypeOrmModule.forFeature([MedicalRecord, User, Role, Permission]),
    PetsModule,
    DiagnosticTypesModule,
  ],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}