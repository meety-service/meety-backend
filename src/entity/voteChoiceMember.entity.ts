import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    MetadataWithSuchNameAlreadyExistsError,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { VoteChoice } from './voteChoice.entity';


@Entity({ name: 'vote_choice_member' })
export class VoteChoiceMember extends BaseEntity {
  @PrimaryColumn({ name: 'member_id'})
  member_id: number;

  @ManyToOne(type => Member, member => member.vote_choice_members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id'})
  member: Member;

  @PrimaryColumn({ name: 'vote_choice_id'})
  vote_choice_id: number;

  @ManyToOne(type => VoteChoice, vote_choice => vote_choice.vote_choice_members,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vote_choice_id', referencedColumnName: 'id'})
  vote_choice: VoteChoice;
}