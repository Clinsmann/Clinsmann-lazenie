import {
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  HttpCode,
  Controller,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Job } from './job.entity';
import { JobService } from './job.service';
import { JobRequest } from './dto/JobRequest';
import { ResponseDto } from '../../utils/ResponseDto';
import { ValidationPipe } from '../../ValidationPipe';
import { JobRequestResponse } from './dto/JobRequestResponse';
import { ApiOperation } from '@nestjs/swagger';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ApiOperation({ description: 'Request a job to be created.' })
  async requestJob(
    @Body(new ValidationPipe<JobRequest>())
    createJobDto: JobRequest,
  ): Promise<ResponseDto<JobRequestResponse>> {
    const job = await this.jobService.createJob(createJobDto);
    return new ResponseDto<JobRequestResponse>(new JobRequestResponse(job.id));
  }

  @Get()
  async getJobs(@Query() query): Promise<{ total: number; jobs: Job[] }> {
    return this.jobService.getJobs(query.pageSize, query.pageNumber);
  }

  @Get(':jobId')
  async getJob(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<Job> {
    return this.jobService.getJobById(jobId);
  }

  @Patch(':jobId/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelJob(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<ResponseDto<JobRequestResponse>> {
    const updatedJob = await this.jobService.cancelJob(jobId);
    return new ResponseDto<JobRequestResponse>(
      new JobRequestResponse(updatedJob.id),
    );
  }
}
