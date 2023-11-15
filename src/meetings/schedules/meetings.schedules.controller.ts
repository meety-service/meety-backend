import { Controller, Get } from '@nestjs/common';
import { MeetingsSchedulesService } from './meetings.schedules.service';

@Controller('meetings.schedules')
export class MeetingsSchedulesController {
  constructor(
    private readonly MeetingsSchedulesService: MeetingsSchedulesService,
  ) {}
}
