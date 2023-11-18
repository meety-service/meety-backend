import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { Member } from './member.entity';
  

@Entity({ name: 'select_timetable' })
export class SelectTimetable extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @ManyToOne(type => Meeting, meeting => meeting.select_timetables, { primary: true, onDelete: 'CASCADE' })
  meeting_id: number;

  @ManyToOne(type => Member, member => member.select_timetables, { primary: true, onDelete: 'CASCADE' })
  member_id: number;

  @ManyToOne(type => MeetingDate, meeting_date => meeting_date.select_timetables,{ primary: true, onDelete: 'CASCADE' })
  meeting_date_id: number;

  @Column()
  select_time: Date;
}