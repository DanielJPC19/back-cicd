import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { error } from 'console';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Basic Swagger configuration
	const config = new DocumentBuilder()
		.setTitle('Veterinary API')
		.setDescription('API documentation for the veterinary clinic')
		.setVersion('1.0')
		.build();

	// Create Swagger document
	const document = SwaggerModule.createDocument(app, config);

	// Serve Swagger UI at /api
	SwaggerModule.setup('api', app, document);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(error);
