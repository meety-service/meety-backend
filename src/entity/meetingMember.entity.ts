import {
BaseEntity,
Column,
Entity,
PrimaryGeneratedColumn,
ManyToOne,
JoinColumn,
PrimaryColumn,
} from 'typeorm';
import { Meeting } from './meeting.entity';
import { Member } from './member.entity';
  

@Entity({ name: 'meeting_member' })
export class MeetingMember extends BaseEntity {
  @PrimaryColumn({ name: 'meeting_id' })
  meeting_id: number;

  @PrimaryColumn({ name: 'member_id' })
  member_id: number;

  @ManyToOne((type) => Meeting, meeting => meeting.meeting_members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;
  
  @ManyToOne(type => Member, member => member.meeting_members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;
  
  @Column()
  nickname: string;

  @Column({default:1})
  list_visible: number;
}