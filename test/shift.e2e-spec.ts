import { v4 as UUIDv4 } from 'uuid';
import { HttpStatus, ValidationPipe } from '@nestjs/common';

import * as request from 'supertest';
import { Connection } from 'typeorm';
import { jobStub } from './stubs/job.stub';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { Job } from '../src/modules/job/job.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../src/modules/database/database.service';
import {
  Status,
  JOB_REPOSITORY,
  SHIFT_REPOSITORY,
  SHIFTS_URL_PATH,
  JOBS_URL_PATH,
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

  describe('Shift Controller - FETCH', () => {
    it('fetch all shifts : 200', async () => {
      const { jobInstance } = jobStub();
      await dbConnection.getRepository<Job>(JOB_REPOSITORY).save(jobInstance);
      const response = await request(httpServer).get(SHIFTS_URL_PATH);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].shiftStatus).toBe(Status.PENDING);
      expect(response.body[0].talentId).toBe(null);
    });

    it('fetch all shifts when there is no record in the db : 200', async () => {
      const response = await request(httpServer).get(SHIFTS_URL_PATH);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.length).toBe(0);
    });

    it('fetch shifts for a particular job : correct id 200', async () => {
      const { jobInstance } = jobStub();
      const job = await dbConnection
        .getRepository<Job>(JOB_REPOSITORY)
        .save(jobInstance);
      const response = await request(httpServer).get(
        `${SHIFTS_URL_PATH}/${job.id}`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      response.body.data.shifts.forEach((shift) => {
        expect(shift.jobId).toBe(job.id);
      });
    });

    it('fetch shifts for a particular job : wrong Id : 400', async () => {
      const response = await request(httpServer).get(
        `${SHIFTS_URL_PATH}/23jka`,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(
        'Validation failed (uuid  is expected)',
      );
    });

    it('fetch shifts for a particular job : non existing valid uuid : 200 : empty[]', async () => {
      const response = await request(httpServer).get(
        `${SHIFTS_URL_PATH}/${UUIDv4()}`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.shifts.length).toBe(0);
    });
  });

  describe('Shift Controller: Book', () => {
    it('Book a shift with the correct shift ID and correct talent ID : 204', async () => {
      const { jobInstance } = jobStub();
      const talent = UUIDv4();
      const job = await dbConnection
        .getRepository<Job>(JOB_REPOSITORY)
        .save(jobInstance);

      const response = await request(httpServer)
        .patch(`${SHIFTS_URL_PATH}/${job.shifts[0].id}/book`)
        .send({ talent });

      const jobRes = await request(httpServer).get(
        `${JOBS_URL_PATH}/${job.id}`,
      );

      const bookedShift = jobRes.body.shifts.find(
        (shift) => shift.id === job.shifts[0].id,
      );

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      expect(bookedShift.shiftStatus).toBe(Status.BOOKED);
      expect(bookedShift.talentId).toBe(talent);
    });

    it('Book a shift with the correct shift ID and correct talent ID but the shift has been booked already: 400', async () => {
      const { jobInstance } = jobStub();
      const talent = UUIDv4();
      const job = await dbConnection
        .getRepository<Job>(JOB_REPOSITORY)
        .save(jobInstance);

      await request(httpServer)
        .patch(`${SHIFTS_URL_PATH}/${job.shifts[0].id}/book`)
        .send({ talent });

      const response = await request(httpServer)
        .patch(`${SHIFTS_URL_PATH}/${job.shifts[0].id}/book`)
        .send({ talent });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Shift has already been booked.');
    });
  });

  describe('Shift Controller: Cancel', () => {
    it('Cancel shift by shift ID : 204', async () => {
      const { jobInstance } = jobStub();
      const talent = UUIDv4();
      const job = await dbConnection
        .getRepository<Job>(JOB_REPOSITORY)
        .save(jobInstance);

      await request(httpServer)
        .patch(`${SHIFTS_URL_PATH}/${job.shifts[0].id}/book`)
        .send({ talent });

      const jobRes = await request(httpServer).get(
        `${JOBS_URL_PATH}/${job.id}`,
      );

      const bookedShift = jobRes.body.shifts.find(
        (shift) => shift.id === job.shifts[0].id,
      );

      const cancelRes = await request(httpServer).patch(
        `${SHIFTS_URL_PATH}/${job.shifts[0].id}/cancel`,
      );

      const jobRes2 = await request(httpServer).get(
        `${JOBS_URL_PATH}/${job.id}`,
      );

      const bookedShift2 = jobRes2.body.shifts.find(
        (shift) => shift.id === bookedShift.id,
      );

      expect(cancelRes.status).toBe(HttpStatus.NO_CONTENT);
      expect(bookedShift2.shiftStatus).toBe(Status.CANCEL);
      expect(bookedShift2.talentId).toBe(talent);
    });

    it('Cancel shift by shift ID that has not been booked : 400', async () => {
      const { jobInstance } = jobStub();
      const job = await dbConnection
        .getRepository<Job>(JOB_REPOSITORY)
        .save(jobInstance);

      const response = await request(httpServer).patch(
        `${SHIFTS_URL_PATH}/${job.shifts[0].id}/cancel`,
      );

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Shift has not been booked.');
    });
  });

  describe('Shift Controller: Fetch', () => {
    it('Cancel shift by talent ID : 204 and Replacement Shift', async () => {
      const { jobInstance } = jobStub();
      const talent = UUIDv4();
      const job = await dbConnection
        .getRepository<Job>(JOB_REPOSITORY)
        .save(jobInstance);

      await request(httpServer)
        .patch(`${SHIFTS_URL_PATH}/${job.shifts[0].id}/book`)
        .send({ talent });

      const jobRes = await request(httpServer).get(
        `${JOBS_URL_PATH}/${job.id}`,
      );

      const bookedShift = jobRes.body.shifts.find(
        (shift) => shift.id === job.shifts[0].id,
      );

      const cancelRes = await request(httpServer).patch(
        `${SHIFTS_URL_PATH}/talent/${talent}/cancel`,
      );

      const jobRes2 = await request(httpServer).get(
        `${JOBS_URL_PATH}/${job.id}`,
      );

      const bookedShift2 = jobRes2.body.shifts.find(
        (shift) => shift.id === bookedShift.id,
      );

      const replacementShift = jobRes2.body.shifts.find(
        (shift) =>
          shift.startTime === bookedShift.startTime &&
          shift.shiftStatus === Status.PENDING,
      );

      expect(cancelRes.status).toBe(HttpStatus.NO_CONTENT);
      expect(bookedShift2.shiftStatus).toBe(Status.CANCEL);
      expect(bookedShift2.talentId).toBe(talent);

      /* check replacement shift */
      expect(replacementShift.talentId).toBe(null);
      expect(replacementShift.startTime).toBe(bookedShift2.startTime);
      expect(replacementShift.endTime).toBe(bookedShift2.endTime);
      expect(replacementShift.shiftStatus).toBe(Status.PENDING);
    });
  });
});
