import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Headers,
} from '@nestjs/common';
import { MeetingsScheduleService } from './meetings.schedule.service';
import { ScheduleDto } from 'src/meetings/schedule/dto/schedule.dto';
@Controller('meetings/:id/schedule')
export class MeetingsScheduleController {
  constructor(
    private readonly MeetingsScheduleService: MeetingsScheduleService,
  ) {}

  @Post()
  createSchedules(
    @Headers() headers,
    @Param('id') meetingId: number,
    @Body() scheduleDto: ScheduleDto,
  ) {
    return this.MeetingsScheduleService.createSchedules(
      headers,
      meetingId,
      scheduleDto,
    );
  }

  @Get()
  getPersonalSchedules(@Headers() headers, @Param('id') meetingId: number) {
    return this.MeetingsScheduleService.getPersonalSchedules(
      headers,
      meetingId,
    );
  }

  @Put()
  updateSchedules(
    @Headers() headers,
    @Param('id') meetingId: number,
    @Body() newSchedule: ScheduleDto,
  ) {
    return this.MeetingsScheduleService.updateSchedules(
      headers,
      meetingId,
      newSchedule,
    );
  }

  @Get('/all')
  getAllSchedules(@Param('id') meetingId: number) {
    return this.MeetingsScheduleService.getAllSchedules(meetingId);
  }
}
