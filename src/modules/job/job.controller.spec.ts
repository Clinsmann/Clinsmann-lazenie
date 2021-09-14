import { Test, TestingModule } from '@nestjs/testing';

import { JobService } from './job.service';
import { Status } from '../../utils/constants';
import { JobController } from './job.controller';
import { jobStub } from '../../../test/stubs/job.stub';

describe('JobsController', () => {
  let controller: JobController;
  const { jobInstance: mockJob, job } = jobStub();

  const mockJobService = {
    createJob: jest.fn(() => {
      return Promise.resolve(mockJob);
    }),

    cancelJob: jest.fn((jobId: string) => {
      return Promise.resolve({
        ...mockJob,
        id: jobId,
        jobStatus: Status.CANCEL,
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [JobService],
    })
      .overrideProvider(JobService)
      .useValue(mockJobService)
      .compile();

    controller = module.get<JobController>(JobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a job', async () => {
    const response = await controller.requestJob(job);
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('jobId');
    expect(response.data.jobId).toBe(mockJob.id);
    expect(mockJobService.createJob).toHaveBeenCalled();
  });

  it('should cancel a job', async () => {
    const response = await controller.cancelJob(mockJob.id);
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('jobId');
    expect(response.data.jobId).toBe(mockJob.id);
    expect(mockJobService.cancelJob).toHaveBeenCalled();
  });
});
