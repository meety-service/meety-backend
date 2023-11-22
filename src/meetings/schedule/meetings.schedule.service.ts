import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundException, InvalidRequestException } from 'src/common/exception/service.exception';
import { Meeting } from 'src/entity/meeting.entity';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { MeetingMember } from 'src/entity/meetingMember.entity';
import { SelectTimetable} from 'src/entity/selectTimetable.entity';
import {
  ScheduleDto,
  SelectTimetableDto,
} from 'src/meetings/schedule/dto/schedule.dto';
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

    await this.meetingMembers.update(
      { meeting_id: meetingId, member_id: memberId },
      { nickname: scheduleDto.nickname },
    );

    const availableMeetingDates = await this.meetingDates.find({
      where: { meeting_id: meetingMember.meeting_id },
    });

    // TODO: 더 간단한 로직으로
    await Promise.all(
      availableMeetingDates.map(async (date) => {
        return Promise.all(
          scheduleDto.select_times.map(async (item) => {
            if (item.date === date.available_date) {
              return Promise.all(
                item.times.map(async (time) => {
                  Logger.debug('time: ' + JSON.stringify(time.time));

                  await this.selectTimetables.insert({
                    meeting_id: meetingMember.meeting_id,
                    member_id: meetingMember.member_id,
                    meeting_date_id: date.id,
                    select_time: time.time,
                  });
                }),
              );
            }
          }),
        );
      }),
    );
  }

  async getPersonalSchedules(
    meetingId: number,
    memberId: number,
  ): Promise<ScheduleDto> {
    const meetingMember = await this.meetingMembers.findOne({
      where: { member_id: memberId, meeting_id: meetingId },
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
      where: { meeting_id: meetingId, member_id: memberId },
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

    const response: ScheduleDto = {
      nickname: meetingMember.nickname,
      select_times: selectedItems,
    };

    return response;
  }

  isDateInRange(date: string, startDate: string, endDate: string): boolean {
    const dateMs = new Date(date).getTime();
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    return dateMs >= startMs && dateMs <= endMs;
  }

  async updateSchedules(
    meetingId: number,
    memberId: number,
    newSchedule: ScheduleDto,
  ) {
    const meetingMember = await this.meetingMembers.findOne({
      where: { member_id: memberId, meeting_id: meetingId },
    });
    if (!meetingMember)
      throw EntityNotFoundException('일치하는 데이터가 존재하지 않습니다.');

    const availableMeetingDates = await this.meetingDates.find({
      where: { meeting_id: meetingMember.meeting_id },
    });

    let schedules: SelectTimetable[] = [];

    newSchedule.select_times.map((date)=>{
      //스케줄의 날짜가 범위내의 날짜 인지 확인
      const meetingDate = availableMeetingDates.find(availableDate => {return availableDate.available_date == date.date;});
      
      if(!meetingDate){
        throw InvalidRequestException('가능한 미팅 날짜 범위 밖입니다');
      }

      //해당 날짜의 timetable을 임시변수에 추가
      date.times.map((time)=>{
        const selectTimetable = new SelectTimetable();
        selectTimetable.meeting_id = meetingId;
        selectTimetable.meeting_date_id = meetingDate.id;
        selectTimetable.member_id = memberId;
        selectTimetable.select_time = time.time;
        schedules.push(selectTimetable);
      })

    })

    //member 닉네임 업데이트
    await this.meetingMembers.update(
      { meeting_id: meetingId, member_id: memberId },
      { nickname: newSchedule.nickname },
    );

    //기존 스케줄 삭제
    await this.selectTimetables.delete({member_id: memberId, meeting_id: meetingId});

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
      current.setUTCMinutes(current.getUTCMinutes() + 30);
    }

    return resultTimetable;
  }

  async getAllSchedules(meetingId: number) {
    /*
    {
      "members" : 3,
      "schedules" : [{"date" : "2023-11-02", 
                      "times" :
                        [{"time" : "12:00:00", "available" : [{"nickname" : "아무개"}, {"nickname" : "김아무개"}], "unavailable" : [{"nickname" : "박아무개"}]},
                        {"time" : "12:30:00", "available" : [{"nickname" : "아무개"}, {"nickname" : "김아무개"}, {"nickname" : "박아무개"}], "unavailable" : []}],
                    {"date" : "2023-11-03", 
                     "times" :
                      [{"time" : "12:00:00", "available" : [{"nickname" : "아무개"}, {"nickname" : "김아무개"}], "unavailable" : [{"nickname" : "박아무개"}]},
                      {"time" : "12:30:00", "available" : [{"nickname" : "박아무개"}], "unavailable" : [{"nickname" : "아무개"}, {"nickname" : "김아무개"}]}]
      }]
    }
    */

    // 1. meeting에 참여하는 member 파싱
    // 2. meeting의 start_time, end_time 파싱
    // 3. start_time ~ end_time까지 30분 단위로 배열 생성
    // 4. meeting의 available date 배열을 찾음
    // 5. available date 배열을 순회하면서

    const meetingMembers = await this.meetingMembers.find({
      where: { meeting_id: meetingId },
    });
    const meeting = await this.meetings.findOne({ where: { id: meetingId } });

    if (!meetingMembers || !meeting)
      throw EntityNotFoundException('일치하는 데이터가 존재하지 않습니다.');

    const availableTimetables = this.generateAvailableTimetable(
      meeting.start_time,
      meeting.end_time,
    );

    const availableMeetingDates = await this.meetingDates.find({
      where: { meeting_id: meeting.id },
    });

    if (!availableMeetingDates)
      throw EntityNotFoundException('일치하는 데이터가 존재하지 않습니다.');

    // 각 member 별, 각 date별, 가능한 시작 시간 unit들을 모은 객체 배열.
    const availableSchedulesForMember = await Promise.all(
      meetingMembers.map(async (member) => {
        const selectedTimesForDates = await Promise.all(
          availableMeetingDates.map(async (date) => {
            // 해당 date에 대해, 해당 member가 고른 시간들을 넣어줌
            const selectedTimesFromDB = await this.selectTimetables.find({
              where: {
                meeting_id: meetingId,
                member_id: member.meeting_id,
                meeting_date_id: date.id,
              },
            });

            if (!selectedTimesFromDB)
              return { date: date.available_date, times: [] };

            const selectedTimes = selectedTimesFromDB.map((time) => {
              return { time: time.select_time };
            });

            return { date: date.available_date, times: selectedTimes };
          }),
        );

        return { member, selectedTimesForDates };
      }),
    );

    // generate schedules
    const schedules = availableMeetingDates.map((meetingDate) => {
      const currentDate = meetingDate.available_date;

      const times = availableTimetables.map((timetable) => {
        // 각 timetable 별 작업 수행
        const available = [];
        const unavailable = [];

        availableSchedulesForMember.forEach((memberSchedules) => {
          // 각 member 별, 각 date 별 필터링
          const selectedTimesForDate =
            memberSchedules.selectedTimesForDates.find(
              (selectedTimesForDate) =>
                selectedTimesForDate.date === currentDate,
            );

          if (!selectedTimesForDate)
            unavailable.push({ nickname: memberSchedules.member.nickname });
          else {
            // 해당하는 date가 있음, timetable을 찾아야함.

            const availableTime = selectedTimesForDate.times.find(
              (time) => time.time === timetable,
            );

            if (!availableTime)
              unavailable.push({ nickname: memberSchedules.member.nickname });
            else available.push({ nickname: memberSchedules.member.nickname });
          }
        });

        return {
          time: timetable,
          available,
          unavailable,
        };
      });

      return {
        date: currentDate,
        times,
      };
    });

    return { members: meetingMembers.length, schedules };
  }
}
