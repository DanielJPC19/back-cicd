import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserNotFoundException } from "../../common/exceptions";
import { UsersService } from "./users/users.service";

interface JwtPayload {
    sub: number;
    email: string;
    permissions: string[];
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
        private config: ConfigService,
        private usersService: UsersService,
	) {
		const jwtSecret = config.get<string>('JWT_SECRET');
		if (!jwtSecret) {
			throw new Error(
				'JWT_SECRET is not defined in environment variables',
			);
		}

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtSecret,
		});
	}

	async validate(payload: JwtPayload) {
		const user = await this.usersService.findOne(payload.sub);
		if (!user) return new UserNotFoundException(payload.email)
		
		return user;
	}
}