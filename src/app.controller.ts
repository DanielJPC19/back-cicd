import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	@ApiOperation({ summary: 'Mensaje de bienvenida de la API' })
	@ApiResponse({ status: 200, description: 'Devuelve un mensaje simple de saludo.' })
	getHello(): string {
		return this.appService.getHello();
	}
}
