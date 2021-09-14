export abstract class Constants {
  static readonly STATUS_CANCEL: string = 'canceled';
  static readonly STATUS_BOOKED: string = 'booked';
}

export enum Status {
  CANCEL = 'canceled',
  BOOKED = 'booked',
  PENDING = 'pending',
}

export const JOBS_URL_PATH = '/jobs';
export const SHIFTS_URL_PATH = '/shifts';
export const SHIFT_REPOSITORY = 'shifts';
export const JOB_REPOSITORY = 'jobs';
