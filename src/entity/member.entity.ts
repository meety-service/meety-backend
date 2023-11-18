import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Meeting } from './meeting.entity';
import { SelectTimetable } from './selectTimetable.entity';
import { VoteChoiceMember } from './voteChoiceMember.entity';
  

@Entity({ name: 'member' })
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  token: number;

  @Column()
  email: string;

  @OneToMany(type => Meeting, meeting => meeting.member_id)
  meetings: Meeting[];

  @OneToMany(type => MeetingMember, meeting_member => meeting_member.member_id)
  meeting_members: MeetingMember[];

  @OneToMany(type => SelectTimetable, select_timetable => select_timetable.member_id)
  select_timetables: SelectTimetable[];y

  @OneToMany(type => VoteChoiceMember, vote_choice_member => vote_choice_member.member_id)
  vote_choice_members: VoteChoiceMember[];
}