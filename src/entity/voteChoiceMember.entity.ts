import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    MetadataWithSuchNameAlreadyExistsError,
} from 'typeorm';
import { Member } from './member.entity';
import { VoteChoice } from './voteChoice.entity';


@Entity({ name: 'vote_choice_name' })
export class VoteChoiceMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  vote_choice_id: number;
  
  @PrimaryGeneratedColumn()
  member_id: number;

  @ManyToOne(type => Member, member => member.vote_choice_members,{ primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: member_id, referencedColumnName: id})
  member: Member;
  
  @ManyToOne(type => VoteChoice, vote_choice => vote_choice.vote_choice_members,{ primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: vote_choice_id, referencedColumnName: id})
  vote_choice: VoteChoice;
}