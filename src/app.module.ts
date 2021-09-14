import { Module } from '@nestjs/common';
import { JobModule } from './modules/job/job.module';
import { ShiftModule } from './modules/shift/shift.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JobModule,
    ShiftModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
