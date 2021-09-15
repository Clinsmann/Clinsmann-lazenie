import { v4 as UUIDv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

export class JobRequestResponse {
  @ApiProperty({ default: UUIDv4() })
  jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }
}
