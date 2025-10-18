import { Module } from '@nestjs/common';
import { DiagnosticTypesModule } from './diagnostic-types/diagnostic-types.module';
import { SpeciesModule } from './species/species.module';

@Module({
	imports: [
		SpeciesModule,
		DiagnosticTypesModule,
	],
	exports: [
		SpeciesModule,
		DiagnosticTypesModule,
	],
})
export class CatalogsModule {}