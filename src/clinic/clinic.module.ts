import { Module } from '@nestjs/common';
import { CatalogsModule } from '../catalogs/catalogs.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PetsModule } from './pets/pets.module';

@Module({
	imports: [
		CatalogsModule,
		PetsModule,
		MedicalRecordsModule,
		DiagnosticsModule,
		AppointmentsModule,
	],
	exports: [
		CatalogsModule,
		PetsModule,
		MedicalRecordsModule,
		DiagnosticsModule,
		AppointmentsModule,
	],
})
export class ClinicModule {}