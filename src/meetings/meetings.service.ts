import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from 'src/entity/meeting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetings: Repository<Meeting>,
  ) {}
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
