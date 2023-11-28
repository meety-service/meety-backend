import {
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Headers,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingDto } from './dto/meeting.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  getMeetingsFromMainScreen(@Headers() headers) {
    return this.meetingsService.getMeetingsFromMainScreen(headers);
  }

  @Delete('/:id')
  deleteMeetingById(@Param('id') meetingId: number) {
    return this.meetingsService.deleteMeetingById(meetingId);
  }

  @Patch('/:id/hiding')
  hideMeetingById(@Headers() headers, @Param('id') meetingId: number) {
    return this.meetingsService.hideMeetingById(headers, meetingId);
  }

  @Post()
  createMeeting(@Headers() headers, @Body() meetingDto: MeetingDto) {
    return this.meetingsService.createMeeting(headers, meetingDto);
  }

  @Get('/:id')
  getMeetingById(@Headers() headers, @Param('id') meetingId: number) {
    return this.meetingsService.getMeetingById(headers, meetingId);
  }

  @Post('/:id/user-state')
  validateUserState(
    @Headers() headers,
    @Param('id') meetingId: number,
    @Body('user_state') userState: number,
  ) {
    return this.meetingsService.validateUserState(
      headers,
      meetingId,
      userState,
    );
  }

  // for test
  @Post('/test/member')
  createMember(@Body('email') email: string) {
    return this.meetingsService.insertMember(email);
  }

  @Post('/test/timezone')
  createTimezone(@Body('name') name: string) {
    return this.meetingsService.insertTimezone(name);
  }

  @Get('/test/all')
  getAllMeeting() {
    return this.meetingsService.getAllMeetings();
  }
}
