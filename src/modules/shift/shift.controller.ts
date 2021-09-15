import {
  Get,
  Body,
  Param,
  Patch,
  Query,
  HttpCode,
  Controller,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Shift } from './shift.entity';
import { ShiftService } from './shift.service';
import { BookTalentRequest } from './dto/BookTalentRequest.dto';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('shifts')
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  @ApiTags('Shift')
  @ApiOkResponse({
    description: 'Retrieved shifts successfully',
    type: [Shift],
  })
  async getAllShifts(@Query() query): Promise<Shift[]> {
    return this.shiftService.getAllShifts(query.pageSize, query.pageNumber);
  }

  @Get(':jobId')
  @ApiTags('Shift')
  @ApiOkResponse({
    description: 'Retrieved shifts successfully',
    type: [Shift],
  })
  async getShiftsByJobId(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<{ data: { shifts: Shift[] } }> {
    const data = await this.shiftService.getShiftsByJobId(jobId);
    return { data: { shifts: data } };
  }

  @ApiTags('Shift')
  @Patch(':shiftId/book')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNoContentResponse({ description: 'Shift booked successfully.' })
  async bookTalent(
    @Param('shiftId', new ParseUUIDPipe()) shiftId: string,
    @Body() dto: BookTalentRequest,
  ): Promise<Shift> {
    return this.shiftService.bookTalent(dto.talent, shiftId);
  }

  @ApiTags('Shift')
  @Patch(':shiftId/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNoContentResponse({ description: 'Shift canceled successfully.' })
  async cancelShiftByShiftId(
    @Param('shiftId', new ParseUUIDPipe()) shiftId: string,
  ): Promise<void> {
    await this.shiftService.cancelShiftByShiftId(shiftId);
  }

  @ApiTags('Shift')
  @Patch('/talent/:talentId/cancel')
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNoContentResponse({ description: 'Shift canceled successfully.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelShiftsByTalentId(
    @Param('talentId', new ParseUUIDPipe()) talentId: string,
  ): Promise<Shift[]> {
    return this.shiftService.cancelShiftsByTalent(talentId);
  }
}
