import { ApiProperty } from '@nestjs/swagger';

export class PageQuery {
  @ApiProperty({ default: 10 })
  pageSize?: number | string;

  @ApiProperty({ default: 1 })
  pageNumber?: number | string;
}
