import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserLoginDto } from './auth/dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({
  	status: 200,
  	description: 'Inicio de sesión exitoso. Devuelve el token JWT.',
  	schema: {
  		example: {
  			access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  		},
  	},
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas.' })
	async login(@Body() body: UserLoginDto) {
		return this.authService.login(body);
	}
}
