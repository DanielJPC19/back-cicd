import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './core/auth/auth.module';
import { ClinicModule } from './clinic/clinic.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

type SupportedDbTypes =
	| 'mysql'
	| 'postgres'
	| 'sqlite'
	| 'mariadb'
	| 'mongodb'
	| 'oracle';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),

		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: configService.get<SupportedDbTypes>('DB_TYPE') ?? 'postgres',
				host: configService.get<string>('DB_HOST') ?? 'localhost',
				port: configService.get<number>('DB_PORT') ?? 5432,
				username: configService.get<string>('DB_USERNAME') ?? 'root',
				password: configService.get<string>('DB_PASSWORD') ?? 'root',
				database: configService.get<string>('DB_DATABASE') ?? 'vet',
				synchronize: configService.get<boolean>('DB_SYNCHRONIZE') ?? false,
				entities: [__dirname + '/**/*.entity{.ts,.js}'],
				namingStrategy: new SnakeNamingStrategy(),


			}),
		}),

		AuthModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
