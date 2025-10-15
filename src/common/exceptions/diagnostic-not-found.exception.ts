import { NotFoundException } from '@nestjs/common';

export class DiagnosticNotFoundException extends NotFoundException {
	constructor(diagnostic?: number | string, code?: string) {
		let message: string;

		if (typeof diagnostic === 'number') {
			message = `Diagnostic with id ${diagnostic} does not exist`;
		} else if (typeof diagnostic === 'string') {
			message = `Diagnostic ${diagnostic} does not exist`;
		} else {
			message = 'No diagnostics found';
		}

		super({
			error: 'Diagnostic Not Found',
			message,
			code,
		});
	}
}