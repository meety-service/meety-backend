import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import {
  Member,
} from './member.entity.ts';

import {
  Timezone,
} from './timezone.entity.js';

import {

}

import { type } from 'os';
import { MeetingMember } from './meetingMember.entity';
import { SelectTimetable } from './selectTimetable.entity';
import { MeetingDate } from './meetingDate.entity'
import { Vote } from './vote.entity.js';

@Entity({ name: 'meeting' })
export class Meeting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @ManyToOne(type=>Member, member =>member.meetings, {primary: true})
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member_id: Member;

  @ManyToOne(type=>Timezone, timezone =>timezone.meetings, {primary: true})
  @JoinColumn({ name: 'timezone_id', referencedColumnName: 'id' })
  timezone_id: Timezone;

  @Column({
    length: 50,
  })
  name: string;

  @Column()
  start_time: number;

  @Column()
  end_time: number;

  @OneToMany(type => MeetingMember, meeting_member => meeting_member.meeting_id)
  meeting_members: MeetingMember[];

  @OneToMany(type => MeetingDate, meeting_date => meeting_date.meeting_id)
  meeting_dates: MeetingDate[];

  @OneToMany(type => SelectTimetable, select_timetable => select_timetable.meeting_id)
  select_timetables: SelectTimetable[];

  @OneToOne(type =>Vote, vote => vote.meeting_id)
  @JoinColumn()
  vote: Vote;
}