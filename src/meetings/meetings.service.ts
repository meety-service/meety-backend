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
import { AvailableDate } from './dto/availableDate.dto';

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

  // for test
  async getAllMeetings(): Promise<Meeting[]> {
    return await this.meetings.find();
  }

  async getMeetingsFromMainScreen(memberId: number) {
    const meetingWithMembers = await this.meetingMembers.find({
      where: { member_id: memberId, list_visible: 1 },
    });
    const meetings = await Promise.all(
      meetingWithMembers.map(async (meetingWithMember) => {
        const meeting = await this.meetings.findOne({
          where: { id: meetingWithMember.meeting_id },
        });

        return {
          id: meeting.id,
          name: meeting.name,
          isMaster: meeting.member_id === meetingWithMember.member_id ? 1 : 0,
          user_state: meetingWithMember.user_state,
        };
      }),
    );

    return meetings;
  }

  async deleteMeetingById(meetingId: number) {
    const targetMeeting = await this.meetings.findOne({
      where: { id: meetingId },
    });
    if (!targetMeeting)
      throw EntityNotFoundException('해당되는 미팅 ID를 찾을 수 없습니다.');

    await this.meetings.delete({ id: meetingId });
  }

  async hideMeetingById(
    memberId: number,
    meetingId: number,
  ) {
    await this.meetingMembers.update(
      { meeting_id: meetingId, member_id: memberId },
      { list_visible: 0 },
    );
  }

  generateDateList(startDate: string, endDate: string): string[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateList: string[] = [];

    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      dateList.push(`${year}-${month}-${day}`);
    }

    return dateList;
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
      name: meetingDto.name,
      member_id: manager.id,
      timezone_id: timezone.id,
      start_time: meetingDto.start_time,
      end_time: meetingDto.end_time,
    });

    const meetingId = meetingResult.identifiers[0].id;

    if (!meetingId)
      throw EntityNotFoundException('미팅이 올바르게 생성되지 않았습니다.');

    meetingDto.available_dates.map(async (availableDate: AvailableDate) => {
      await this.meetingDates.insert({
        meeting_id: meetingId,
        available_date: availableDate.date,
      });
    });

    await this.meetingMembers.insert({
      meeting_id: meetingId,
      member_id: managerId,
      nickname: '',
      list_visible: 1,
    });

    return {"id" : meetingId};
  }

  async getMeetingById(meetingId: number) {
    const memberId = 1; // TODO: member id 수정

    const meeting = await this.meetings.findOne({ where: { id: meetingId } });
    const meetingDates = await this.meetingDates.find({
      where: { meeting_id: meetingId },
    });

    if (!meeting || !meetingDates)
      throw EntityNotFoundException('해당되는 미팅 ID를 찾을 수 없습니다.');

    const member = await this.meetingMembers.findOne({
      where: { meeting_id: meetingId, member_id: memberId },
    });

    meeting.meeting_dates = meetingDates;

    return { ...meeting, user_state: member ? member.user_state : -1 };
  }

  async validateUserState(meetingId: number, oldUserState: number) {
    const memberId = 1; // TODO: 수정
    const meetingMember = await this.meetingMembers.findOne({
      where: { meeting_id: meetingId, member_id: memberId },
    });

    if (!meetingMember)
      throw EntityNotFoundException('해당되는 데이터를 찾을 수 없습니다.');

    return {
      is_validate_state: meetingMember.user_state === oldUserState,
      latest_user_state: meetingMember.user_state,
    };
  }

  generateRandomString(length: number): string {
    let result = '';
    let characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async insertMember(email: string) {
    return await this.members.insert({
      token: this.generateRandomString(10),
      email,
    });
  }

  async insertTimezone(name: string) {
    return await this.timezones.insert({ name });
  }
}
