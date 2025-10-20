import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../core/auth/auth.module';
import { GoogleCalendarModule } from '../../core/integrations/google-calendar/google-calendar.module';
import { DiagnosticsModule } from '../diagnostics/diagnostics.module';
import { PetsModule } from '../pets/pets.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from './entities/schedule.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Schedule, Appointment]),
		AuthModule,
		PetsModule,
		DiagnosticsModule,
		GoogleCalendarModule,
	],
	controllers: [AppointmentsController],
	providers: [AppointmentsService],
	exports: [AppointmentsService],
})
export class AppointmentsModule {}
