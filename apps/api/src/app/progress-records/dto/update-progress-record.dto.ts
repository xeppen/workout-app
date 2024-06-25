import { PartialType } from '@nestjs/mapped-types';
import { CreateProgressRecordDto } from './create-progress-record.dto';

export class UpdateProgressRecordDto extends PartialType(
  CreateProgressRecordDto
) {}
