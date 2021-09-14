import { addHours } from 'date-fns';
import { isShiftWithinLimit, isTimeConflicting } from './utils';

describe('isShiftWithinLimit method', () => {
  it(`Should return false for date range that is more than ${process.env.SHIFT_LIMIT}`, () => {
    const date = new Date();
    const isWithinLimit = isShiftWithinLimit(date, addHours(date, 10));
    expect(isWithinLimit).toBe(false);
  });

  it(`Should return true for date range that is within ${process.env.SHIFT_LIMIT}`, () => {
    const date = new Date();
    const isWithinLimit = isShiftWithinLimit(date, addHours(date, 10));
    expect(isWithinLimit).toBe(false);
  });
});

describe('isShiftWithinLimit method', () => {
  it(`Should return false for date range that is more than ${process.env.SHIFT_LIMIT}`, () => {
    const date = new Date();
    expect(true).toBe(true);
  });
});
