import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../dto/user-context.dto';

export const User = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): UserContextDto => {
		const request = ctx.switchToHttp().getRequest();
		const user = request.user;
		
		if (!user) {
			throw new Error('User not found in request');
		}

		return {
			userId: user.id,
			email: user.email,
			role: user.role?.roleName || user.roleName
		};
	},
);
