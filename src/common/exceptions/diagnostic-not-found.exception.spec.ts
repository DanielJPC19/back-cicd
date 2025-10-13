import { DiagnosticNotFoundException } from './diagnostic-not-found.exception';

describe('DiagnosticNotFoundException', () => {
	it('should create exception with diagnostic id', () => {
		const exception = new DiagnosticNotFoundException(123);
		
		expect(exception.message).toBe('Diagnostic with id 123 does not exist');
	});

	it('should create exception with string identifier', () => {
		const exception = new DiagnosticNotFoundException('DIAG123');
		
		expect(exception.message).toBe('Diagnostic DIAG123 does not exist');
	});

	it('should create exception with default message when no id provided', () => {
		const exception = new DiagnosticNotFoundException();
		
		expect(exception.message).toBe('No diagnostics found');
	});
});