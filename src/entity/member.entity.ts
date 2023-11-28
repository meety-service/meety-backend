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
import { MeetingMember } from './meetingMember.entity';
  

@Entity({ name: 'member' })
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({nullable:true})
  token: string;

  @Column({nullable:true})
  email: string;

  @OneToMany(type => Meeting, meeting => meeting.member)
  meetings: Meeting[];

  @OneToMany(type => MeetingMember, meeting_member => meeting_member.member)
  meeting_members: MeetingMember[];

  @OneToMany(type => SelectTimetable, select_timetable => select_timetable)
  select_timetables: SelectTimetable[];y

  @OneToMany(type => VoteChoiceMember, vote_choice_member => vote_choice_member.member)
  vote_choice_members: VoteChoiceMember[];
}