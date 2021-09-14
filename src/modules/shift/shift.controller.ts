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
import { BookTalentRequest } from './dto/BookTalentRequest';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get(':jobId')
  async getShifts(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<{ data: { shifts: Shift[] } }> {
    const data = await this.shiftService.getShifts(jobId);
    return { data: { shifts: data } };
  }

  @Patch(':shiftId/book')
  @HttpCode(204)
  async bookTalent(
    @Param('shiftId', new ParseUUIDPipe()) shiftId: string,
    @Body() dto: BookTalentRequest,
  ): Promise<Shift> {
    return this.shiftService.bookTalent(dto.talent, shiftId);
  }

  @Get()
  async getAllShifts(@Query() query): Promise<Shift[]> {
    return this.shiftService.getAllShifts(query.pageSize, query.pageNumber);
  }

  @Patch(':shiftId/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelShiftByShiftId(
    @Param('shiftId', new ParseUUIDPipe()) shiftId: string,
  ): Promise<void> {
    await this.shiftService.cancelShiftByShiftId(shiftId);
  }

  @Patch('/talent/:talentId/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelShiftsByTalentId(
    @Param('talentId', new ParseUUIDPipe()) talentId: string,
  ): Promise<Shift[]> {
    return this.shiftService.cancelShiftsByTalent(talentId);
  }
}
