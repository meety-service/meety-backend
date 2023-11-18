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
  hideMeetingById(
    @Param('id') meetingId: number,
    @Body('list_visible') listVisible: number,
  ) {
    const memberId = 1; // TODO: member Id를 request에서 파싱
    return this.meetingsService.hideMeetingById(meetingId, memberId, listVisible);
  }

  @Post()
  createMeeting() {
    const success = this.meetingsService.createMeeting();
    return { success };
  }

  @Get('/:id')
  getMeetingById(@Param('id') meetingId: number) {
    return this.meetingsService.getMeetingById(meetingId);
  }
}
