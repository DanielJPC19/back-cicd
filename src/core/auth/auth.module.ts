import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsService } from './permissions/permissions.service';

@Module({
	controllers: [UsersController, RolesController, PermissionsController],
	providers: [UsersService, RolesService, PermissionsService],
	//exports: [],
	//providers: [],
})
export class AuthModule {}
