import { Controller, Get } from '@nestjs/common';
import { MeetingsScheduleService } from './meetings.schedule.service';

@Controller('meetings/:id/schedule')
export class MeetingsScheduleController {
  constructor(
    private readonly MeetingsScheduleService: MeetingsScheduleService,
  ) {}
}
