import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { JwtStrategy } from './jwt.strategy';
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsService } from './permissions/permissions.service';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
	controllers: [AuthController, UsersController, RolesController, PermissionsController, ],
	providers: [AuthService,UsersService, RolesService, PermissionsService,JwtStrategy,PermissionsGuard],
	imports: [TypeOrmModule.forFeature([User,Role,Permission]),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('JWT_SECRET') || 'defaultSecret',
				signOptions: {
					expiresIn:
                        config.get<string | number>('JWT_EXPIRES_IN') || '1h',
				},
			}),
		}),
	],
	exports: [UsersService, RolesService, PermissionsService, PermissionsGuard],
})
export class AuthModule {}
