import { Module } from '@nestjs/common';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PetsModule } from './pets/pets.module';
import { SpeciesModule } from './species/species.module';

@Module({
	imports: [
		SpeciesModule,
		PetsModule,
		MedicalRecordsModule,
		DiagnosticsModule,
	],
	exports: [
		SpeciesModule,
		PetsModule,
		MedicalRecordsModule,
		DiagnosticsModule,
	],
})
export class ClinicModule {}