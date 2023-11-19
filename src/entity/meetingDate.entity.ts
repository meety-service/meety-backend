import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SelectTimetable } from './selectTimetable.entity';
import { Meeting } from './meeting.entity';
import { VoteChoice } from './voteChoice.entity';
  

@Entity({ name: 'meeting_date' })
export class MeetingDate extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({name:'meeting_id'})
  meeting_id: number;

  @ManyToOne(type => Meeting, meeting => meeting.meeting_dates,{ onDelete: 'CASCADE' })
  @JoinColumn({name:'meeting_id'})
  meeting: Meeting;

  @Column({type:'date'})
  available_date: string;

  @OneToMany(type => SelectTimetable, select_timetable => select_timetable.meeting_date)
  select_timetables: SelectTimetable[];

  @OneToMany(type => VoteChoice, vote_choices => vote_choices.vote)
  vote_choices: VoteChoice[];
}