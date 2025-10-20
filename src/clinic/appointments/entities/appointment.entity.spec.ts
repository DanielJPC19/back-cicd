import { Appointment } from './appointment.entity';

describe('Appointment', () => {
	it('should be defined', () => {
		expect(new Appointment()).toBeDefined();
	});
});

