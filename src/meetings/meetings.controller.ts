import {
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  getMeetings() {
    return this.meetingsService.getMeetings();
  }

  @Delete('/:id')
  deleteMeetingById(@Param('id') meetingId: number) {
    return this.meetingsService.deleteMeetingById(meetingId);
  }

  @Patch('/:id/hiding')
  patchMeetingById(
    @Param('id') meetingId: number,
    @Body('list_visible') listVisible: number,
  ) {
    const success = this.meetingsService.patchMeetingById(meetingId, listVisible);
    return {success};
  }

  @Post()
  createMeeting() {
    const success = this.meetingsService.createMeeting();
    return {success};
  }

  @Get('/:id')
  getMeetingById(@Param('id') meetingId: number) {
    return this.meetingsService.getMeetingById(meetingId);
  }
}
