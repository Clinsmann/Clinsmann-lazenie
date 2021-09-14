import { v4 as UUIDv4 } from 'uuid';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { addHours, subHours } from 'date-fns';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, ValidationPipe } from '@nestjs/common';

import { jobStub } from './stubs/job.stub';
import { AppModule } from '../src/app.module';
import { Job } from '../src/modules/job/job.entity';
import { DatabaseService } from '../src/modules/database/database.service';
import {
  Status,
  JOBS_URL_PATH,
  JOB_REPOSITORY,
  SHIFT_REPOSITORY,
} from '../src/utils/constants';

describe('Job Module - Integration test', () => {
  let app: any;
  let httpServer: any;
  let dbConnection: Connection;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AppModule],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDBHandle();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
    await dbConnection.getRepository(JOB_REPOSITORY).delete({});
    await dbConnection.getRepository(SHIFT_REPOSITORY).delete({});
  });

  afterEach(async () => {
    await dbConnection.getRepository(JOB_REPOSITORY).delete({});
    await dbConnection.getRepository(SHIFT_REPOSITORY).delete({});
  });

  describe('Jobs controller - FETCH', () => {
    it('get jobs with pagination -> 200', async () => {
      const { jobInstance } = jobStub();
      await dbConnection.getRepository<Job>(JOB_REPOSITORY).save(jobInstance);
      const response = await request(httpServer).get(JOBS_URL_PATH);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.total).toBe(1);
      expect(response.body.jobs[0].id).toBe(jobInstance.id);
      expect(response.body.jobs[0].companyId).toBe(jobInstance.companyId);
      expect(response.body.jobs[0].shifts.length).toBeGreaterThan(0);
      expect(response.body.jobs[0].shifts[0].jobId).toBe(jobInstance.id);
      expect(response.body.jobs[0].jobStatus).toBe(Status.BOOKED);
    });

    it('get a single job -> 200', async () => {
      const { jobInstance } = jobStub();
      const res: any = await dbConnection
        .getRepository(JOB_REPOSITORY)
        .save(jobInstance);
      const response = await request(httpServer).get(
        `${JOBS_URL_PATH}/${res.id}`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.companyId).toBe(jobInstance.companyId);
    });

    it('get a single job with correct uuid but not existing -> 404', async () => {
      const response = await request(httpServer).get(
        `${JOBS_URL_PATH}/${UUIDv4()}`,
      );
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('Jobs Controller - CREATE', () => {
    it('create Job with the correct payload -> 201', async () => {
      const { job } = jobStub();
      const response = await request(httpServer).post(JOBS_URL_PATH).send(job);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.data.jobId).toBeTruthy();
      const response2 = await request(httpServer).get(
        `${JOBS_URL_PATH}/${response.body.data.jobId}`,
      );
      expect(response2.body.id).toBe(response.body.data.jobId);
    });

    it('create jobs With wrong company ID -> 400', async () => {
      const { job } = jobStub();
      const response = await request(httpServer)
        .post(JOBS_URL_PATH)
        .send({
          ...job,
          companyId: 11,
        });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('companyId must be a UUID');
      expect(response.body.message.length).toBeGreaterThan(0);
    });

    it('create jobs wrong dates format -> 400', async () => {
      const { job } = jobStub();
      const response = await request(httpServer)
        .post(JOBS_URL_PATH)
        .send({
          ...job,
          end: '11-u',
          start: '11-u',
        });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('start must be a Date instance');
      expect(response.body.message).toContain('end must be a Date instance');
      expect(response.body.message.length).toBeGreaterThan(1);
    });

    it('create jobs With empty payload -> 400', async () => {
      const response = await request(httpServer).post(JOBS_URL_PATH).send({});
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('companyId must be a UUID');
      expect(response.body.message).toContain('companyId should not be empty');
      expect(response.body.message).toContain('start should not be empty');
      expect(response.body.message).toContain('start must be a Date instance');
      expect(response.body.message).toContain('end should not be empty');
      expect(response.body.message).toContain('end must be a Date instance');
      expect(response.body.message.length).toBeGreaterThan(0);
    });

    it('create jobs With start date is in the past -> 400', async () => {
      const { job } = jobStub();
      const response = await request(httpServer)
        .post(JOBS_URL_PATH)
        .send({
          ...job,
          start: subHours(job.start, 12),
          end: subHours(job.end, 18),
        });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(
        'The start date must not be in the past',
      );
    });

    it('create jobs With end date comes before the start date -> 400', async () => {
      const { job } = jobStub();
      const response = await request(httpServer)
        .post(JOBS_URL_PATH)
        .send({
          ...job,
          start: job.start,
          end: subHours(job.start, 1),
        });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(
        'The end date must be after start date',
      );
    });

    it('create jobs With shift length more than 8 hours -> 400', async () => {
      const { job } = jobStub();
      const response = await request(httpServer)
        .post(JOBS_URL_PATH)
        .send({
          ...job,
          start: job.start,
          end: addHours(job.end, 2),
        });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(
        'The shift should not be more than 8 hours.',
      );
    });

    it('create jobs With shift length less than 2 hours -> 400', async () => {
      const { job } = jobStub();
      const response = await request(httpServer)
        .post(JOBS_URL_PATH)
        .send({
          ...job,
          start: job.start,
          end: addHours(job.start, 1),
        });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(
        'The shift should not be less than 2 hours.',
      );
    });
  });

  describe('Jobs Controller - CANCEL', () => {
    it('cancel job with correct Job ID -> 204', async () => {
      const { jobInstance } = jobStub();
      const { id }: any = await dbConnection
        .getRepository(JOB_REPOSITORY)
        .save(jobInstance);
      const cancelRes = await request(httpServer).patch(
        `${JOBS_URL_PATH}/${id}/cancel`,
      );
      const response = await request(httpServer).get(`${JOBS_URL_PATH}/${id}`);
      expect(cancelRes.status).toBe(HttpStatus.NO_CONTENT);
      expect(response.status).toBe(HttpStatus.OK);
      response.body.shifts.forEach((shift) => {
        expect(shift.shiftStatus).toBe(Status.CANCEL);
      });
    });

    it('cancel job with wrong Job ID -> 400', async () => {
      const response = await request(httpServer).patch(
        `${JOBS_URL_PATH}/112/cancel`,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(
        'Validation failed (uuid  is expected)',
      );
    });

    it("cancel job with correct Job ID that doesn't have a record in the db -> 404", async () => {
      const response = await request(httpServer).patch(
        `${JOBS_URL_PATH}/${UUIDv4()}/cancel`,
      );
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Record not found.');
    });
  });
});
