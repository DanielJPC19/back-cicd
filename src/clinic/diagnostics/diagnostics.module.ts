import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../core/auth/entities/permission.entity';
import { Role } from '../../core/auth/entities/role.entity';
import { User } from '../../core/auth/entities/user.entity';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { RolesService } from '../../core/auth/roles/roles.service';
import { UsersService } from '../../core/auth/users/users.service';
import { DiagnosticTypesModule } from '../diagnostic-types/diagnostic-types.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { Diagnostic } from './entities/diagnostic.entity';

@Module({
  controllers: [DiagnosticsController],
  providers: [DiagnosticsService, UsersService, RolesService, PermissionsGuard],
  imports: [
    TypeOrmModule.forFeature([Diagnostic, User, Role, Permission]),
    MedicalRecordsModule,
    DiagnosticTypesModule,
  ],
  exports: [DiagnosticsService],
})
export class DiagnosticsModule {}