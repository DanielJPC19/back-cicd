import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from './auth/dto/login-user.dto';
import { UsersService } from './auth/users/users.service';

import { UserNotFoundException } from '../common/exceptions';

@Injectable()
export class AuthService {
	constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.findByEmail(email)
		if(!user) throw new UserNotFoundException(email)
		const matches = await bcrypt.compare(password, user.password);

		if(!matches) throw new UnauthorizedException()
		
		return user;
	}

	async login(userLoginDto: UserLoginDto) {
		const user = await this.validateUser(
			userLoginDto.email,
			userLoginDto.password
		)

		
		const permissions = user.role.permissions.map(p => p.permissionName);

		const payload = { sub: user.id, email: user.email, permissions }
  
		return { access_token: this.jwtService.sign(payload) }
	}



}