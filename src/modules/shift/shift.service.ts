import { v4 as UUIDv4 } from 'uuid';
import { Repository } from 'typeorm';
import { addHours, subHours } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Shift } from './shift.entity';
import { Status } from '../../utils/constants';
import { isTimeConflicting } from '../../utils/utils';

const shiftSelect = [
  'id',
  'talentId',
  'jobId',
  'shiftStatus',
  'startTime AS start',
  'endTime AS end',
];
@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly repository: Repository<Shift>,
  ) {}

  public async getAllShifts(
    pageSize?: number,
    pageNumber?: number,
  ): Promise<Shift[]> {
    const take = pageSize || Number(process.env.SHIFT_PAGE_SIZE);
    const skip = (pageNumber > 0 ? pageNumber - 1 : 0) * take;

    return this.repository
      .createQueryBuilder('shift')
      .orderBy({ createdAt: 'ASC' })
      .select(shiftSelect)
      .skip(skip)
      .take(take)
      .getRawMany();
  }

  public async getShiftsByJobId(jobId: string): Promise<Shift[]> {
    return this.repository
      .createQueryBuilder('shift')
      .where({ jobId })
      .select(shiftSelect)
      .getRawMany();
  }

  public async bookTalent(talent: string, shiftId: string): Promise<Shift> {
    const shift = await this.repository.findOne(shiftId);
    if (!shift) {
      throw new HttpException('Shift not found.', HttpStatus.NOT_FOUND);
    }

    if (shift.shiftStatus == Status.BOOKED) {
      throw new HttpException(
        'Shift has already been booked.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const talentShifts = await this.repository.find({
      where: {
        talentId: talent,
        shiftStatus: Status.BOOKED,
      },
      order: { endTime: 'DESC' },
    });

    if (
      isTimeConflicting(shift.startTime, talentShifts) ||
      isTimeConflicting(shift.endTime, talentShifts)
    ) {
      throw new HttpException(
        'The shifts are conflicting.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      isTimeConflicting(
        subHours(shift.startTime, Number(process.env.BREAK_IN_BETWEEN_SHIFT)),
        talentShifts,
      ) ||
      isTimeConflicting(
        addHours(shift.endTime, Number(process.env.BREAK_IN_BETWEEN_SHIFT)),
        talentShifts,
      )
    ) {
      throw new HttpException(
        `There must be ${process.env.BREAK_IN_BETWEEN_SHIFT} hours break in between shifts`,
        HttpStatus.BAD_REQUEST,
      );
    }

    shift.talentId = talent;
    shift.shiftStatus = Status.BOOKED;
    return this.repository.save(shift);
  }

  public async cancelShiftByShiftId(shiftId: string): Promise<Shift> {
    const shift = await this.repository.findOne(shiftId, {
      relations: ['job'],
    });

    if (!shift.shiftStatus || shift.shiftStatus === Status.BOOKED) {
      shift.shiftStatus = Status.CANCEL;
      return this.repository.save(shift);
    } else {
      throw new HttpException(
        'Shift has not been booked.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async createReplacementShifts(shifts: Shift[]): Promise<Shift[]> {
    const newShifts: any = shifts.map((oldShift) => {
      const startTime = oldShift.startTime;
      const endTime = oldShift.endTime;
      const shift = new Shift();
      shift.id = UUIDv4();
      shift.job = oldShift.job;
      shift.startTime = startTime;
      shift.endTime = endTime;
      shift.shiftStatus = Status.PENDING;
      return shift;
    });

    return this.repository.save(newShifts);
  }

  public async cancelShiftsByTalent(talentId: string): Promise<Shift[]> {
    const shift = await this.repository.find({
      where: {
        talentId: talentId,
        shiftStatus: Status.BOOKED,
      },
      relations: ['job'],
    });
    shift.map((shift) => {
      shift.shiftStatus = Status.CANCEL;
      return shift;
    });
    await this.repository.save(shift);
    return this.createReplacementShifts(shift);
  }
}
