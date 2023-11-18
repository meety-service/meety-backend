import { Injectable } from '@nestjs/common';
import { Schedule } from 'src/meetings/schedule/dto/schedule.dto';

@Injectable()
export class MeetingsScheduleService {
  createSchedules(meetingId: number): boolean {
    return false;
  }

  getPersonalSchedules(meetingId: number): Schedule {
    return;
  }

  updateSchedules(meetingId: number, newSchedule: Schedule): boolean {
    return false;
  }

  getAllSchedules(meetingId: number): Schedule[] {
    return [];
  }
}
