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
  Timezone,
} from './timezone.entity.js';

import { type } from 'os';
import { MeetingMember } from './meetingMember.entity';
import { SelectTimetable } from './selectTimetable.entity';
import { MeetingDate } from './meetingDate.entity'
import { Vote } from './vote.entity.js';
import { Member } from './member.entity.js';

@Entity({ name: 'meeting' })
export class Meeting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ name: 'member_id' })
  member_id: number;

  @ManyToOne(type=>Member, member =>member.meetings)
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member;

  @Column({ name: 'timezone_id' })
  timezone_id: number;

  @ManyToOne(type=>Timezone, timezone =>timezone.meetings)
  @JoinColumn({ name: 'timezone_id', referencedColumnName: 'id' })
  timezone: Timezone;

  @Column({
    length: 50,
  })
  name: string;

  @Column({type:'time'})
  start_time: string;

  @Column({type: 'time'})
  end_time: string;

  @OneToMany(type => MeetingMember, meeting_member => meeting_member.meeting)
  meeting_members: MeetingMember[];

  @OneToMany(type => MeetingDate, meeting_date => meeting_date.meeting)
  meeting_dates: MeetingDate[];

  @OneToMany(type => SelectTimetable, select_timetable => select_timetable.meeting)
  select_timetables: SelectTimetable[];

  @OneToOne(type =>Vote, vote => vote.meeting, { cascade: true })
  @JoinColumn({name:"vote_id"})
  vote: Vote;
}