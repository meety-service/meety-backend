import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from 'src/entity/meeting.entity';
import { MeetingMember } from 'src/entity/meetingMember.entity';
import { Repository } from 'typeorm';
import { MeetingDto } from './dto/meeting.dto';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { Member } from 'src/entity/member.entity';
import { Timezone } from 'src/entity/timezone.entity';
import { EntityNotFoundException } from 'src/common/exception/service.exception';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetings: Repository<Meeting>,
    @InjectRepository(MeetingMember)
    private meetingMembers: Repository<MeetingMember>,
    @InjectRepository(MeetingDate)
    private meetingDates: Repository<MeetingDate>,
    @InjectRepository(Member)
    private members: Repository<Member>,
    @InjectRepository(Timezone)
    private timezones: Repository<Timezone>,
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

  async createMeeting(meetingDto: MeetingDto, managerId: number) {
    const manager = await this.members.findOne({ where: { id: managerId } });
    const timezone = await this.timezones.findOne({
      where: { id: meetingDto.timezone_id },
    });

    if (!manager || !timezone)
      throw EntityNotFoundException(
        '미팅을 생성하기 위한 속성이 유효하지 않습니다.',
      );

    const meetingResult = await this.meetings.insert({
      member_id: manager.id,
      timezone_id: timezone.id,
      name: meetingDto.name,
      start_time: meetingDto.start_time,
      end_time: meetingDto.end_time,
    });

    const meetingId = meetingResult.identifiers[0].id;

    if (!meetingId)
      throw EntityNotFoundException('미팅이 올바르게 생성되지 않았습니다.');

    meetingDto.available_date.map(async (availableDate) => {
      await this.meetingDates.insert({
        meeting_id: meetingId,
        available_date: availableDate,
      });
    });
  }

  async getMeetingById(meetingId: number) {
    const meeting = await this.meetings.findOne({ where: { id: meetingId } });
    const meetingDates = await this.meetingDates.find({
      where: { id: meetingId },
    });

    if (!meeting || !meetingDates)
      throw EntityNotFoundException('미팅을 찾을 수 없습니다');

    meeting.meeting_dates = meetingDates;

    return meeting;
  }
}
