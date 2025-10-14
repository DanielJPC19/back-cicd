import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeciesModule } from '../../catalogs/species/species.module';
import { AuthModule } from '../../core/auth/auth.module';
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