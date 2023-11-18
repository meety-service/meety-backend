import {
BaseEntity,
Column,
Entity,
PrimaryGeneratedColumn,
ManyToOne,
JoinColumn,
} from 'typeorm';
  

@Entity({ name: 'meeting_member' })
export class MeetingMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  meeting_id: number;

  @PrimaryGeneratedColumn()
  member_id: number;

  @ManyToOne(type => Meeting, meeting => meeting.meeting_members, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;

  @ManyToOne(type => Member, member => member.meeting_members, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;
  
  @Column()
  nickname: string;

  @Column()
  list_visible: number;
}