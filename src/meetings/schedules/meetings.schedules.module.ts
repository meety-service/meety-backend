import { Module } from '@nestjs/common';
import { MeetingsSchedulesController } from './meetings.schedules.controller';
import { MeetingsSchedulesService } from './meetings.schedules.service';

@Module({
  controllers: [MeetingsSchedulesController],
  providers: [MeetingsSchedulesService],
})
export class MeetingsSchedulesModules {}
