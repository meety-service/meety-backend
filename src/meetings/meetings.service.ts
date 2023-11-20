import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from 'src/entity/meeting.entity';
import { MeetingMember } from 'src/entity/meetingMember.entity';
import { Repository } from 'typeorm';
import { MeetingDto } from './dto/meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetings: Repository<Meeting>,
    @InjectRepository(MeetingMember)
    private meetingMembers: Repository<MeetingMember>,
  ) {}

  async getMeetings(): Promise<Meeting[]> {
    return await this.meetings.find();
  }

  async deleteMeetingById(meetingId: number) {
    const targetMeeting = await this.meetings.findOne({
      where: { id: meetingId },
    });
    if (!targetMeeting)
      throw new HttpException('Meeting Not Found', HttpStatus.NOT_FOUND);

    await this.meetings.delete({ id: meetingId });
  }

  async hideMeetingById(
    memberId: number,
    meetingId: number,
    listVisible: number,
  ) {
    await this.meetingMembers.update(
      { meeting_id: meetingId, member_id: memberId },
      { list_visible: listVisible },
    );
  }

  createMeeting(): boolean {
    return false;
  }

  getMeetingById(meetingId: number): Meeting {
    return;
  }
}
