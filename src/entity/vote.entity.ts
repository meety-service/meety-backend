import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Meeting } from './meeting.entity';
import { VoteChoice } from './voteChoice.entity';

@Entity({ name: 'vote' })
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @OneToOne(type => Meeting, meeting => meeting.vote_id)
  @JoinColumn({ name: meeting_id, referencedColumnName: 'id'})
  meeting: Meeting;

  @Column()
  meeting_id: number;

  @Column()
  close: number;

  @OneToMany(type => VoteChoice, vote_choice => vote_choice.vote_id)
  vote_choices: VoteChoice[];
}