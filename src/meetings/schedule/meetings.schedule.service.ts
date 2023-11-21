import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundException } from 'src/common/exception/service.exception';
import { Meeting } from 'src/entity/meeting.entity';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { MeetingMember } from 'src/entity/meetingMember.entity';
import { Member } from 'src/entity/member.entity';
import { SelectTimetable } from 'src/entity/selectTimetable.entity';
import {
  ScheduleDto,
  SelectTimetableDto,
} from 'src/meetings/schedule/dto/schedule.dto';
import { Repository } from 'typeorm';

@Injectable()
export class MeetingsScheduleService {
  constructor(
    @InjectRepository(Meeting) private meetings: Repository<Meeting>,
    @InjectRepository(Member) private members: Repository<Member>,
    @InjectRepository(MeetingMember)
    private meetingMembers: Repository<MeetingMember>,
    @InjectRepository(Member)
    private selectTimetables: Repository<SelectTimetable>,
    @InjectRepository(MeetingDate)
    private meetingDates: Repository<MeetingDate>,
  ) {}

  async createSchedules(
    meetingId: number,
    memberId: number,
    scheduleDto: ScheduleDto,
  ) {
    const meetingMember = await this.meetingMembers.findOne({
      where: { member_id: memberId, meeting_id: meetingId },
    });
    if (!meetingMember)
      throw EntityNotFoundException('일치하는 데이터가 존재하지 않습니다.');

    const availableMeetingDates = await this.meetingDates.find({
      where: { meeting_id: meetingMember.meeting_id },
    });

    // TODO: 더 간단한 로직으로
    availableMeetingDates.forEach(async (date) => {
      scheduleDto.selected_items.forEach(async (item) => {
        if (item.date === date.available_date) {
          item.times.forEach(async (time) => {
            await this.selectTimetables.insert({
              meeting_id: meetingMember.meeting_id,
              member_id: meetingMember.member_id,
              meeting_date_id: date.id,
              select_time: time,
            });
          });
        }
      });
    });
  }

  }

  updateSchedules(meetingId: number, newSchedule: ScheduleDto): boolean {
    return false;
  }

  getAllSchedules(meetingId: number): ScheduleDto[] {
    return [];
  }
}
