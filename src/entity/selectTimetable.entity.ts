import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Meeting } from './meeting.entity';
import { MeetingDate } from './meetingDate.entity';
  

@Entity({ name: 'select_timetable' })
export class SelectTimetable extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({name: 'meeting_id'})
  meeting_id: number;
  
  @ManyToOne(type => Meeting, meeting => meeting.select_timetables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;

  @Column({name: 'member_id'})
  member_id: number;
  
  @ManyToOne(type => Member, member => member.select_timetables, { onDelete: 'CASCADE' })
  @JoinColumn({name:'member_id'})
  member: Member;
  
  @Column({name: 'meeting_date_id'})
  meeting_date_id: number;
  
  @ManyToOne(type => MeetingDate, meeting_date => meeting_date.select_timetables,{ onDelete: 'CASCADE' })
  @JoinColumn({name:'meeting_date_id'})
  meeting_date: MeetingDate;

  @Column({type:'time'})
  select_time: string;
}