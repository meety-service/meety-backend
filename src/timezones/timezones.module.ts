import { Module } from '@nestjs/common';
import { TimezonesController } from './timezones.controller';
import { TimezonesService } from './timezones.service';
import { Timezone } from 'src/entity/timezone.entity';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpExceptionFilter } from 'src/common/exception-filter/http-exception.filter';

@Module({
  controllers: [TimezonesController],
  imports: [TypeOrmModule.forFeature([Timezone])],
  providers: [
    TimezonesService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class TimezonesModule {}
