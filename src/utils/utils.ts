import { differenceInSeconds } from 'date-fns';
import { Shift } from '../modules/shift/shift.entity';

export const isTimeConflicting = (time: Date, shifts: Shift[]): boolean => {
  let isConflict = false;
  for (let i = 0; i < shifts.length; i++) {
    if (time >= shifts[i].startTime && time <= shifts[i].endTime) {
      isConflict = true;
      return isConflict;
    }
  }
  return isConflict;
};

export const isShiftWithinLimit = (start, end): boolean => {
  return (
    differenceInSeconds(end, start) / (60 * 60) >
    parseInt(process.env.SHIFT_LIMIT)
  );
};
