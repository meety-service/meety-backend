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
import { getMemberId, parseToken } from 'src/util';

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

  async getMemberByEmail(email: string) {
    return await this.members.findOne({ where: { email } });
  }

  // for test
  async getAllMeetings(): Promise<Meeting[]> {
    return await this.meetings.find();
  }

  async getMeetingsFromMainScreen(header) {
    const userId = await getMemberId(parseToken(header));
    const member = await this.getMemberByEmail(userId.email);

    const meetingWithMembers = await this.meetingMembers.find({
      where: { member_id: member.id, list_visible: 1 },
    });

    if(!meetingWithMembers)
      throw EntityNotFoundException("로그인 정보를 확인해주세요.");

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

  async hideMeetingById(header, meetingId: number) {
    const userId = await getMemberId(parseToken(header));
    const member = await this.getMemberByEmail(userId.email);

    if(!member)
      throw EntityNotFoundException("로그인 정보를 확인해주세요.");

    await this.meetingMembers.update(
      { meeting_id: meetingId, member_id: member.id },
      { list_visible: 0 },
    );
  }

  async createMeeting(header, meetingDto: MeetingDto) {
    const userId = await getMemberId(parseToken(header));
    const member = await this.getMemberByEmail(userId.email);
    const timezone = await this.timezones.findOne({
      where: { id: meetingDto.timezone_id },
    });

    if (!member || !timezone)
      throw EntityNotFoundException(
        '미팅을 생성하기 위한 속성이 유효하지 않습니다.',
      );

    const meetingResult = await this.meetings.insert({
      name: meetingDto.name,
      member_id: member.id,
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
      member_id: member.id,
      nickname: '',
      list_visible: 1,
    });

    return { id: meetingId };
  }

  async getMeetingById(header, meetingId: number) {
    const userId = await getMemberId(parseToken(header));
    const member = await this.getMemberByEmail(userId.email);

    const meeting = await this.meetings.findOne({ where: { id: meetingId } });
    const meetingDates = await this.meetingDates.find({
      where: { meeting_id: meetingId },
    });

    if (!meeting || !meetingDates)
      throw EntityNotFoundException('해당되는 미팅 ID를 찾을 수 없습니다.');

    const meetingMember = await this.meetingMembers.findOne({
      where: { meeting_id: meetingId, member_id: member.id },
    });

    meeting.meeting_dates = meetingDates;

    return {
      ...meeting,
      user_state: meetingMember ? meetingMember.user_state : -1,
    };
  }

  async validateUserState(header, meetingId: number, oldUserState: number) {
    const userId = await getMemberId(parseToken(header));
    const member = await this.getMemberByEmail(userId.email);
    const meetingMember = await this.meetingMembers.findOne({
      where: { meeting_id: meetingId, member_id: member.id },
    });

    if (!meetingMember)
      throw EntityNotFoundException('해당되는 데이터를 찾을 수 없습니다.');

    return {
      is_validate_state: meetingMember.user_state === oldUserState,
      latest_user_state: meetingMember.user_state,
    };
  }

  // test용 함수
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
