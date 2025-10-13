import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../core/auth/auth.module';
import { SpeciesModule } from '../species/species.module';
import { Pet } from './entities/pet.entity';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  controllers: [PetsController],
  providers: [PetsService],
  imports: [
    TypeOrmModule.forFeature([Pet]),
    SpeciesModule,
    AuthModule
  ],
  exports: [PetsService],
})
export class PetsModule {}