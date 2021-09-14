import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Job } from './job.entity';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { ShiftModule } from '../shift/shift.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), ShiftModule],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
