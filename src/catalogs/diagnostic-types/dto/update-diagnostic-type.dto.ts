import { PartialType } from '@nestjs/swagger';
import { CreateDiagnosticTypeDto } from './create-diagnostic-type.dto';

export class UpdateDiagnosticTypeDto extends PartialType(CreateDiagnosticTypeDto) {}