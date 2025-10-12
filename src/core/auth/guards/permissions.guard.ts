import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../entities/user.entity";

interface AuthenticatedRequest extends Request {
    user?: User;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const required = this.reflector.get<string[]>(
			'permissions',
			context.getHandler(),
		);
		if (!required || required.length === 0) return true;
		const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const user = req.user as User;
		if (!user) throw new ForbiddenException('No autenticado');

		const userPerms = user.role.permissions.map( p => p.permissionName)


		const hasEnoughPermissions = required.every((p: string) =>
			userPerms.includes(p),
		);
		if (!hasEnoughPermissions)
			throw new ForbiddenException();
		return true;
	}
}
