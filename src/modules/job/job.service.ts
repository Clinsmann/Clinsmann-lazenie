import { v4 as UUIDv4 } from 'uuid';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { addHours, eachDayOfInterval, isAfter, isPast } from 'date-fns';

import { Job } from './job.entity';
import { Shift } from '../shift/shift.entity';
import { JobRequest } from './dto/JobRequest.dto';
import { Status } from '../../utils/constants';
import { isShiftWithinLimit } from '../../utils/utils';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async createJob({ companyId, start, end }: JobRequest): Promise<Job> {
    if (isPast(start)) {
      throw new HttpException(
        'The start date must not be in the past',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!isAfter(end, start)) {
      throw new HttpException(
        'The end date must be after start date',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (end < addHours(start, 2)) {
      throw new HttpException(
        'The shift should not be less than 2 hours.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isShiftWithinLimit(start, end)) {
      throw new HttpException(
        'The shift should not be more than 8 hours.',
        HttpStatus.BAD_REQUEST,
      );
    }

    start.setUTCHours(8);
    end.setUTCHours(17);
    const job = new Job();
    // job.id = UUIDv4();
    job.companyId = companyId;
    job.startTime = start;
    job.endTime = end;

    job.shifts = eachDayOfInterval({ start, end }).map((day) => {
      const startTime = new Date(day);
      startTime.setUTCHours(8);
      const endTime = new Date(day);
      endTime.setUTCHours(17);
      const shift = new Shift();
      shift.id = UUIDv4();
      shift.job = job;
      shift.startTime = startTime;
      shift.endTime = endTime;
      return shift;
    });
    return this.jobRepository.save(job);
  }

  async cancelJob(jobId: string): Promise<Job> {
    const job = await this.getJobById(jobId);
    if (!job.jobStatus || job.jobStatus === Status.BOOKED) {
      job.jobStatus = Status.CANCEL;
      job.updatedAt = new Date();
      job.shifts = job.shifts.map((shift) => {
        shift.shiftStatus = Status.CANCEL;
        return shift;
      });
    }
    return this.jobRepository.save(job);
  }

  public async getJobs(
    pageSize?: number | string,
    pageNumber?: number | string,
  ): Promise<{ total: number; jobs: Job[] }> {
    pageSize = Number(pageSize);
    pageNumber = Number(pageNumber);
    const take = pageSize || Number(process.env.PAGE_SIZE);
    const skip = (pageNumber > 0 ? pageNumber - 1 : 0) * take;
    const [result, total] = await this.jobRepository.findAndCount({
      select: ['id', 'companyId', 'startTime', 'endTime', 'jobStatus'],
      order: { createdAt: 'ASC' },
      skip,
      take,
    });
    return { total, jobs: result };
  }

  public async getJobById(jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne(
      { id: jobId },
      { relations: ['shifts'] },
    );
    if (!job) {
      throw new HttpException('Record not found.', HttpStatus.NOT_FOUND);
    }
    return job;
  }
}
