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
import { JobRequest } from './dto/JobRequest.dto';
import { ResponseDto } from '../../utils/ResponseDto';
import { ValidationPipe } from '../../ValidationPipe';
import { JobRequestResponse } from './dto/JobRequestResponse.dto';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { PageQuery } from './dto/pageQuery.dto';

@Controller('jobs')
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ApiTags('Job')
  @ApiCreatedResponse({
    description: 'Job created successfully',
    type: JobRequestResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiOperation({ description: 'Request a job to be created.' })
  async requestJob(
    @Body(new ValidationPipe<JobRequest>())
    createJobDto: JobRequest,
  ): Promise<ResponseDto<JobRequestResponse>> {
    const job = await this.jobService.createJob(createJobDto);
    return new ResponseDto<JobRequestResponse>(new JobRequestResponse(job.id));
  }

  @ApiTags('Job')
  @ApiOkResponse({
    description: 'Retrieved shifts successfully',
    type: [Job],
  })
  @Get()
  async getJobs(
    @Query() query: PageQuery,
  ): Promise<{ total: number; jobs: Job[] }> {
    return this.jobService.getJobs(query.pageSize, query.pageNumber);
  }

  @Get(':jobId')
  @ApiTags('Job')
  @ApiNotFoundResponse({ description: 'Record not found.' })
  @ApiBadRequestResponse({ description: 'Bad request. Enter a valid job ID.' })
  async getJob(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<Job> {
    return this.jobService.getJobById(jobId);
  }

  @ApiTags('Job')
  @Patch(':jobId/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNotFoundResponse({ description: 'Record not found.' })
  @ApiNoContentResponse({ description: 'Job canceled successfully.' })
  @ApiBadRequestResponse({ description: 'Bad request. Enter a valid job ID.' })
  async cancelJob(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<ResponseDto<JobRequestResponse>> {
    const updatedJob = await this.jobService.cancelJob(jobId);
    return new ResponseDto<JobRequestResponse>(
      new JobRequestResponse(updatedJob.id),
    );
  }
}
