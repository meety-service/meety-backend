import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

import { Vote } from './vote.entity';
import { MeetingDate } from './meetingDate.entity';
import { VoteChoiceMember } from './voteChoiceMember.entity';

@Entity({ name: 'vote_choice' })
export class VoteChoice extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vote_id: number;

  @ManyToOne(type => Vote, vote => vote.vote_choices,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vote_id', referencedColumnName: 'id'})
  vote: Vote;

  @Column()
  meeting_date_id: number;

  @ManyToOne(type => MeetingDate, meeting_date => meeting_date.vote_choices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_date_id', referencedColumnName: 'id'})
  meeting_date: MeetingDate;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @OneToMany(type => VoteChoiceMember, vote_choice_member => vote_choice_member.vote_choice_id)
  vote_choice_members: VoteChoiceMember[];
}