import {
BaseEntity,
Column,
Entity,
PrimaryGeneratedColumn,
OneToMany,
} from 'typeorm';
import { Meeting } from './meeting.entity';

@Entity({ name: 'timezone' })
export class Timezone extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  name: string;

  @OneToMany(type => Meeting, meeting => meeting.timezone)
  meetings: Meeting[];

}