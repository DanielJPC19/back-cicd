import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './auth/dto/login-user.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

    @Post('login')
	async login(@Body() body: UserLoginDto) {
		return this.authService.login(body);
	}
}