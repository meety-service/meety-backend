import { Module } from '@nestjs/common';
import { MeetingsScheduleController } from './meetings.schedule.controller';
import { MeetingsScheduleService } from './meetings.schedule.service';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/common/exception-filter/http-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from 'src/entity/meeting.entity';
import { MeetingMember } from 'src/entity/meetingMember.entity';
import { SelectTimetable } from 'src/entity/selectTimetable.entity';
import { MeetingDate } from 'src/entity/meetingDate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      MeetingMember,
      SelectTimetable,
      MeetingDate,
    ]),
  ],
  controllers: [MeetingsScheduleController],
  providers: [
    MeetingsScheduleService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class MeetingsScheduleModules {}
