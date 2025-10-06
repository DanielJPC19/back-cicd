import { CreateUserDto } from "./create-user.dto";

import { OmitType } from '@nestjs/mapped-types';


export class UserOutDto extends OmitType(CreateUserDto, ['password'] as const) {}
