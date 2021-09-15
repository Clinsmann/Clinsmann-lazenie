import { v4 as UUIDv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsDate, IsUUID } from 'class-validator';
import { addHours } from 'date-fns';

export class JobRequest {
  @ApiProperty({ default: UUIDv4() })
  @IsNotEmpty()
  @IsUUID(4)
  companyId: string;

  @ApiProperty({ default: addHours(new Date(), 2) })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  start: Date;

  @ApiProperty({ default: addHours(new Date(), 7) })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  end: Date;
}
