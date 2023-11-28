import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityNotFoundException,
  InvalidRequestException,
  NoRightException,
} from 'src/common/exception/service.exception';
import { Meeting } from 'src/entity/meeting.entity';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { MeetingMember } from 'src/entity/meetingMember.entity';
import { Member } from 'src/entity/member.entity';
import { SelectTimetable } from 'src/entity/selectTimetable.entity';
import {
  AllScheduleDateDto,
  ScheduleDto,
  SelectTimetableDto,
} from 'src/meetings/schedule/dto/schedule.dto';
import { getMemberId, parseToken } from 'src/util';
import { Repository } from 'typeorm';

@Injectable()
export class MeetingsScheduleService {
  constructor(
    @InjectRepository(Meeting) private meetings: Repository<Meeting>,
    @InjectRepository(MeetingMember)
    private meetingMembers: Repository<MeetingMember>,
    @InjectRepository(SelectTimetable)
    private selectTimetables: Repository<SelectTimetable>,
    @InjectRepository(MeetingDate)
    private meetingDates: Repository<MeetingDate>,
    @InjectRepository(Member)
    private members: Repository<Member>,
  ) {}

  async createSchedules(headers, meetingId: number, scheduleDto: ScheduleDto) {
    const userId = await getMemberId(parseToken(headers));
    const member = await this.members.findOne({
      where: { email: userId.email },
    });

    if (!member) {
      throw NoRightException('로그인 정보가 유효하지 않습니다.');
    }

    let meetingMember = await this.meetingMembers.findOne({
      where: { member_id: member.id, meeting_id: meetingId },
    });

    // URL을 공유 받아서 새롭게 미팅에 참여하는 경우 새롭게 멤버를 meeting_member에 추가
    if (!meetingMember) {
      meetingMember = await this.meetingMembers.save({
        meeting_id: meetingId,
        member_id: member.id,
        nickname: scheduleDto.nickname,
        list_visible: 1,
      });
    }

    // user state가 투표 단계로 넘어간 경우 스케줄 생성 불가
    if (meetingMember.user_state > 1)
      throw InvalidRequestException('잘못된 user state 값입니다.');

    await this.meetingMembers.update(
      { meeting_id: meetingId, member_id: member.id },
      { nickname: scheduleDto.nickname, user_state: 1 },
    );

    // update는 update함수를 통해 이루어지지만, 클라이언트에서 잘못 호출하거나 닉네임 변경 등이 필요할 때
    await this.selectTimetables.delete({
      meeting_id: meetingId,
      member_id: member.id,
    });

    const availableMeetingDates = await this.meetingDates.find({
      where: { meeting_id: meetingMember.meeting_id },
    });

    await Promise.all(
      scheduleDto.select_times.map(async (timetable) => {
        const dateId = availableMeetingDates.find(
          (date) => date.available_date === timetable.date,
        ).id;
        return Promise.all(
          timetable.times.map(async (time) => {
            await this.selectTimetables.insert({
              meeting_id: meetingMember.meeting_id,
              member_id: meetingMember.member_id,
              meeting_date_id: dateId,
              select_time: time.time,
            });
          }),
        );
      }),
    );
  }

  async getPersonalSchedules(headers, meetingId: number) {
    const userId = await getMemberId(parseToken(headers));
    const member = await this.members.findOne({
      where: { email: userId.email },
    });

    if (!member) {
      throw NoRightException('로그인 정보가 유효하지 않습니다.');
    }

    const meetingMember = await this.meetingMembers.findOne({
      where: { member_id: member.id, meeting_id: meetingId },
    });
    if (!meetingMember)
      throw EntityNotFoundException('일치하는 데이터가 존재하지 않습니다.');

    // TODO: meeting id에 해당하는 meeting의 가능한 dates 목록을 뽑음.
    // 해당 available meeting dates에 해당하는 meeting dates id를 기준으로,
    // selected time table에서 meeting id와 member id가 동시에 일치하는 목록을 일단 다 뽑고
    // available meeting dates를 기준으로 mapping해줌.

    const availableMeetingDates = await this.meetingDates.find({
      where: { meeting_id: meetingId },
    });

    const selectTimetable = await this.selectTimetables.find({
      where: { meeting_id: meetingId, member_id: member.id },
    });

    const selectedItems: SelectTimetableDto[] = availableMeetingDates
      .map((availableDate) => {
        const times = selectTimetable
          .filter((time) => time.meeting_date_id == availableDate.id)
          .map((time) => {
            return { time: time.select_time };
          });
        return {
          date: availableDate.available_date,
          times: times,
        };
      })
      .filter((item) => item.times.length > 0);

    return {
      nickname: meetingMember.nickname,
      select_times: selectedItems,
      user_state: meetingMember.user_state,
    };
  }

  async updateSchedules(headers, meetingId: number, newSchedule: ScheduleDto) {
    const userId = await getMemberId(parseToken(headers));
    const member = await this.members.findOne({
      where: { email: userId.email },
    });

    if (!member) {
      throw NoRightException('로그인 정보가 유효하지 않습니다.');
    }

    const meetingMember = await this.meetingMembers.findOne({
      where: { member_id: member.id, meeting_id: meetingId },
    });
    if (!meetingMember)
      throw EntityNotFoundException('일치하는 데이터가 존재하지 않습니다.');

    // user state가 투표 단계로 넘어간 경우 스케줄 생성 불가
    if (meetingMember.user_state > 1)
      throw InvalidRequestException('잘못된 user state 값입니다.');

    const availableMeetingDates = await this.meetingDates.find({
      where: { meeting_id: meetingMember.meeting_id },
    });

    let schedules: SelectTimetable[] = [];

    newSchedule.select_times.map((date) => {
      //스케줄의 날짜가 범위내의 날짜 인지 확인
      const meetingDate = availableMeetingDates.find((availableDate) => {
        return availableDate.available_date == date.date;
      });

      if (!meetingDate) {
        throw InvalidRequestException('가능한 미팅 날짜 범위 밖입니다');
      }

      //해당 날짜의 timetable을 임시변수에 추가
      date.times.map((time) => {
        const selectTimetable = new SelectTimetable();
        selectTimetable.meeting_id = meetingId;
        selectTimetable.meeting_date_id = meetingDate.id;
        selectTimetable.member_id = member.id;
        selectTimetable.select_time = time.time;
        schedules.push(selectTimetable);
      });
    });

    //member 닉네임 업데이트
    await this.meetingMembers.update(
      { meeting_id: meetingId, member_id: member.id },
      { nickname: newSchedule.nickname },
    );

    //기존 스케줄 삭제
    await this.selectTimetables.delete({
      member_id: member.id,
      meeting_id: meetingId,
    });

    //스케줄 업데이트
    await this.selectTimetables.save(schedules);
  }

  generateAvailableTimetable(startTime: string, endTime: string): string[] {
    let resultTimetable: string[] = [];
    let current = new Date(`1970-01-01T${startTime}Z`);
    let end = new Date(`1970-01-01T${endTime}Z`);

    while (current <= end) {
      let hours = String(current.getUTCHours()).padStart(2, '0');
      let minutes = String(current.getUTCMinutes()).padStart(2, '0');
      let seconds = String(current.getUTCSeconds()).padStart(2, '0');

      resultTimetable.push(`${hours}:${minutes}:${seconds}`);
      current.setUTCMinutes(current.getUTCMinutes() + 15);
    }

    return resultTimetable;
  }

  async getAllSchedules(meetingId: number) {
    const meetingMembers = await this.meetingMembers.find({
      where: { meeting_id: meetingId },
    });
    const meeting = await this.meetings.findOne({ where: { id: meetingId } });

    if (!meetingMembers || !meeting)
      throw EntityNotFoundException('일치하는 데이터가 존재하지 않습니다.');

    const availableTimetablesDuration = this.generateAvailableTimetable(
      meeting.start_time,
      meeting.end_time,
    );

    const availableMeetingDatesDuration = await this.meetingDates.find({
      where: { meeting_id: meeting.id },
    });

    if (!availableMeetingDatesDuration)
      throw EntityNotFoundException('일치하는 데이터가 존재하지 않습니다.');

    const selectTimetablesFromDB = await this.selectTimetables
      .createQueryBuilder('select_timetable')
      .innerJoinAndSelect('select_timetable.meeting_date', 'meeting_date')
      .select([
        'meeting_date.available_date',
        'select_timetable.member_id',
        'select_timetable.select_time',
      ])
      .where('select_timetable.meeting_id = :meetingId', { meetingId })
      .orderBy('meeting_date.available_date')
      .addOrderBy('select_timetable.select_time')
      .getMany();

    if (selectTimetablesFromDB.length === 0) {
      return { members: meetingMembers.length, schedules: [] };
    }

    const reducedSelectTimetablesFromDB = selectTimetablesFromDB.reduce(
      (acc, cur) => {
        const date = cur.meeting_date.available_date;
        const time = cur.select_time;

        if (!acc[date]) {
          acc[date] = {};
        }
        if (!acc[date][time]) {
          acc[date][time] = [];
        }
        acc[date][time].push({ member_id: cur.member_id });
        return acc;
      },
      {} as Record<string, Record<string, { member_id: number }[]>>,
    );

    const reducedSelectTimetables = Object.entries(
      reducedSelectTimetablesFromDB,
    ).map(([date, times]) => ({
      date,
      times: Object.entries(times).map(([time, available]) => ({
        time,
        available,
      })),
    }));

    const scheduleDates = [];
    availableMeetingDatesDuration.map((dateDuration) => {
      const timesForCurrentDate = reducedSelectTimetables.find(
        (timetable) => timetable.date === dateDuration.available_date,
      );

      const scheduleTimes = [];

      availableTimetablesDuration.map((timetableDuration) => {
        const scheduleNicknames = { available: [], unavailable: [] };
        const scheduleMemberIds = timesForCurrentDate
          ? timesForCurrentDate.times.find(
              (time) => time.time === timetableDuration,
            )
          : undefined;
        meetingMembers.map((member) => {
          const availableMember = scheduleMemberIds
            ? scheduleMemberIds.available.find(
                (memberId) => memberId.member_id === member.member_id,
              )
            : undefined;
          if (availableMember) {
            scheduleNicknames.available.push(member.nickname);
          } else {
            scheduleNicknames.unavailable.push(member.nickname);
          }
        });
        scheduleTimes.push({
          time: timetableDuration,
          available: scheduleNicknames.available,
          unavailable: scheduleNicknames.unavailable,
        });
      });

      scheduleDates.push({
        date: dateDuration.available_date,
        times: scheduleTimes,
      });
    });

    return { members: meetingMembers.length, schedules: scheduleDates };
  }
}
