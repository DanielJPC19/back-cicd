import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleAuthProvider } from './provider/google-auth.provider';

@Module({
	imports: [ConfigModule],
	controllers: [GoogleCalendarController],
	providers: [GoogleCalendarService, GoogleAuthProvider],
	exports: [GoogleCalendarService, GoogleAuthProvider],
})
export class GoogleCalendarModule {}
