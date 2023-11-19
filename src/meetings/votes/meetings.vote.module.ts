import { Module } from '@nestjs/common';
import { MeetingsVoteController } from './meetings.vote.controller';
import { MeetingsVoteService } from './meetings.vote.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from 'src/entity/vote.entity';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { Meeting } from 'src/entity/meeting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vote,
      Meeting
    ]),
  ],
  controllers: [MeetingsVoteController],
  providers: [MeetingsVoteService],
})
export class MeetingsVoteModule {}
