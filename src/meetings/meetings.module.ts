import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/common/exception-filter/http-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from 'src/entity/meeting.entity';
import { MeetingMember } from 'src/entity/meetingMember.entity';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { Member } from 'src/entity/member.entity';
import { Timezone } from 'src/entity/timezone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      MeetingMember,
      MeetingDate,
      Member,
      Timezone,
    ]),
  ],
  controllers: [MeetingsController],
  providers: [
    MeetingsService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class MeetingsModule {}
