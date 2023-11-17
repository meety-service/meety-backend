import { Module } from '@nestjs/common';
import { MeetingsScheduleController } from './meetings.schedule.controller';
import { MeetingsScheduleService } from './meetings.schedule.service';

@Module({
  controllers: [MeetingsScheduleController],
  providers: [MeetingsScheduleService],
})
export class MeetingsScheduleModules {}
