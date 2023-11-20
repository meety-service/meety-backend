import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { MeetingsScheduleService } from './meetings.schedule.service';
import { ScheduleDto } from 'src/meetings/schedule/dto/schedule.dto';
@Controller('meetings/:id/schedule')
export class MeetingsScheduleController {
  constructor(
    private readonly MeetingsScheduleService: MeetingsScheduleService,
  ) {}

  @Post()
  createSchedules(@Param('id') meetingId: number) {
    const success = this.MeetingsScheduleService.createSchedules(meetingId);
    return { success };
  }

  @Get()
  getPersonalSchedules(@Param('id') meetingId: number) {
    return this.MeetingsScheduleService.getPersonalSchedules(meetingId);
  }

  @Put()
  updateSchedules(
    @Param('id') meetingId: number,
    @Body() newSchedule: ScheduleDto,
  ) {
    const success = this.MeetingsScheduleService.updateSchedules(
      meetingId,
      newSchedule,
    );
    return { success };
  }

  @Get('/all')
  getAllSchedules(@Param('id') meetingId: number) {
    return this.MeetingsScheduleService.getAllSchedules(meetingId);
  }
}
