import {
  Entity,
  Column,
  OneToMany,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Shift } from '../shift/shift.entity';
import { JOB_REPOSITORY, Status } from '../../utils/constants';

@Entity({ name: JOB_REPOSITORY })
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @VersionColumn()
  version: number;

  @Column()
  companyId: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @OneToMany(() => Shift, (shift) => shift.job, { cascade: true })
  shifts: Shift[];

  @Column({
    type: 'simple-enum',
    enum: Status,
    default: Status.BOOKED,
    nullable: true,
  })
  jobStatus: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
