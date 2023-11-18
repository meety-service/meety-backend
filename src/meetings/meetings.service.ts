import { Injectable } from '@nestjs/common';
import { Meeting } from 'src/entity/meeting.entity';

@Injectable()
export class MeetingsService {
  getMeetings(): Meeting[] {
    return [];
  }

  deleteMeetingById(meetingId: number): boolean {
    return false;
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
