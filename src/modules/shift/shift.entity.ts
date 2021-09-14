import {
  Entity,
  Column,
  ManyToOne,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Job } from '../job/job.entity';
import { SHIFT_REPOSITORY, Status } from '../../utils/constants';

@Entity({ name: SHIFT_REPOSITORY })
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @VersionColumn()
  version: number;

  @ManyToOne(() => Job, (job) => job.shifts, { onDelete: 'CASCADE' })
  job: Job;

  @Column()
  jobId: string;

  @Column({ nullable: true })
  talentId: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({
    type: 'simple-enum',
    enum: Status,
    default: Status.PENDING,
    nullable: true,
  })
  shiftStatus: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
