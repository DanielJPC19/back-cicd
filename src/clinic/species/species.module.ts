import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../core/auth/auth.module';
import { Species } from './entities/species.entity';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Species]),
		AuthModule
	],
	controllers: [SpeciesController],
	providers: [SpeciesService],
	exports: [SpeciesService, TypeOrmModule],
})
export class SpeciesModule {}