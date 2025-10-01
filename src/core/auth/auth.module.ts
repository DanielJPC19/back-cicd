import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsService } from './permissions/permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Module({
	controllers: [UsersController, RolesController, PermissionsController],
	providers: [UsersService, RolesService, PermissionsService],
	imports: [TypeOrmModule.forFeature([User,Role,Permission])]
	//exports: [],
	//providers: [],
})
export class AuthModule {}
