import { Module } from '@nestjs/common';
import { DiagnosticTypesModule } from './diagnostic-types/diagnostic-types.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PetsModule } from './pets/pets.module';
import { SpeciesModule } from './species/species.module';

@Module({
	imports: [
		SpeciesModule,
		DiagnosticTypesModule,
		PetsModule,
		MedicalRecordsModule,
		DiagnosticsModule,
	],
	exports: [
		SpeciesModule,
		DiagnosticTypesModule,
		PetsModule,
		MedicalRecordsModule,
		DiagnosticsModule,
	],
})
export class ClinicModule {}