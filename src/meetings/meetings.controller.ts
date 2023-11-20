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
import { MeetingDto } from './dto/meeting.dto';

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
    const memberId = 1; // TODO: member id를 request에서 파싱
    return this.meetingsService.hideMeetingById(
      memberId,
      meetingId,
      listVisible,
    );
  }

  @Post()
  createMeeting(@Body() meetingDto: MeetingDto) {
    const managerId = 1; // TODO: member id를 request에서 파싱
    return this.meetingsService.createMeeting(meetingDto, managerId);
  }

  @Get('/:id')
  getMeetingById(@Param('id') meetingId: number) {
    return this.meetingsService.getMeetingById(meetingId);
  }
}
