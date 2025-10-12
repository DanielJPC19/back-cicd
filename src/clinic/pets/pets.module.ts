import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../core/auth/entities/permission.entity';
import { Role } from '../../core/auth/entities/role.entity';
import { User } from '../../core/auth/entities/user.entity';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { RolesService } from '../../core/auth/roles/roles.service';
import { UsersService } from '../../core/auth/users/users.service';
import { SpeciesModule } from '../species/species.module';
import { Pet } from './entities/pet.entity';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  controllers: [PetsController],
  providers: [PetsService, UsersService, RolesService, PermissionsGuard],
  imports: [
    TypeOrmModule.forFeature([Pet, User, Role, Permission]),
    SpeciesModule
  ],
  exports: [PetsService],
})
export class PetsModule {}