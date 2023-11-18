import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/http-exception.filter';

@Module({
  controllers: [MeetingsController],
  providers: [
    MeetingsService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class MeetingsModule {}
