import { v4 as UUIDv4 } from 'uuid';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookTalentRequest {
  @IsUUID(4)
  @IsNotEmpty()
  @ApiProperty({ default: UUIDv4() })
  talent: string;
}
