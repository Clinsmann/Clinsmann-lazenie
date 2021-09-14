import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database:
          configService.get<string>('NODE_ENV') === 'test'
            ? './database.test.sqlite'
            : './database.sqlite',
        entities: [join(__dirname, '../../**/**.entity{.ts,.js}')],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
