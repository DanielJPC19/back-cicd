export interface GoogleCalendarEvent {
	id?: string;
	summary: string;
	description?: string;
	start: {
		dateTime: string;
		timeZone: string;
	};
	end: {
		dateTime: string;
		timeZone: string;
	};
	attendees?: Array<{
		email: string;
		displayName?: string;
		responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
	}>;
	reminders?: {
		useDefault: boolean;
		overrides?: Array<{
			method: 'email' | 'popup';
			minutes: number;
		}>;
	};
	location?: string;
	status?: 'confirmed' | 'tentative' | 'cancelled';
	visibility?: 'default' | 'public' | 'private';
}

export interface GoogleCalendarEventResponse {
	id: string;
	summary: string;
	description?: string;
	start: {
		dateTime: string;
		timeZone: string;
	};
	end: {
		dateTime: string;
		timeZone: string;
	};
	attendees?: Array<{
		email: string;
		displayName?: string;
		responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
	}>;
	reminders?: {
		useDefault: boolean;
		overrides?: Array<{
			method: 'email' | 'popup';
			minutes: number;
		}>;
	};
	location?: string;
	status: 'confirmed' | 'tentative' | 'cancelled';
	visibility: 'default' | 'public' | 'private';
	created: string;
	updated: string;
	htmlLink: string;
}

export interface GoogleCalendarConfig {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	scopes: string[];
}

export interface GoogleAuthTokens {
	access_token: string;
	refresh_token: string;
	scope: string;
	token_type: string;
	expiry_date: number;
}

export interface AppointmentCalendarEvent {
	appointmentId: number;
	title: string;
	description?: string;
	startDateTime: Date;
	endDateTime: Date;
	veterinarianEmail: string;
	petOwnerEmail?: string;
	location?: string;
}

