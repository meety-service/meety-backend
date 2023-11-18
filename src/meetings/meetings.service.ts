import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from 'src/entity/meeting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetings: Repository<Meeting>,
  ) {}

  async getMeetings(): Promise<Meeting[]> {
    return await this.meetings.find();
  }

  async deleteMeetingById(meetingId: number): Promise<any> {
    const targetMeeting = await this.meetings.findOne({
      where: { id: meetingId },
    });
    if (!targetMeeting)
      throw new HttpException('Meeting Not Found', HttpStatus.NOT_FOUND);

    await this.meetings.delete({ id: meetingId });
  }

  patchMeetingById(meetingId: number, listVisible: number): boolean {
    return false;
  }

  createMeeting(): boolean {
    return false;
  }

  getMeetingById(meetingId: number): Meeting {
    return;
  }
}
