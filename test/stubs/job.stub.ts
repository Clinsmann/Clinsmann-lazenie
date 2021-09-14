import { eachDayOfInterval } from 'date-fns';
import { Job } from '../../src/modules/job/job.entity';
import { Shift } from '../../src/modules/shift/shift.entity';
import { v4 as UUIDv4 } from 'uuid';
import { addHours } from 'date-fns';

export const jobStub = (): {
  jobInstance: Job;
  job: {
    companyId: string;
    start: Date;
    end: Date;
  };
} => {
  const companyId = '7c330494-837a-4d95-9023-f1ca3f5a950c';
  const start = addHours(new Date(), 10);
  const end = addHours(new Date(), 18);
  const job = new Job();
  job.id = UUIDv4();
  job.companyId = companyId;
  job.startTime = start;
  job.endTime = end;

  job.shifts = eachDayOfInterval({
    start: start,
    end: end,
  }).map((day) => {
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

  return { jobInstance: job, job: { companyId, start, end } };
};
