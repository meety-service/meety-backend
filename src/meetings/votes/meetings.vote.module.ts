import { Module } from '@nestjs/common';
import { MeetingsVoteController } from './meetings.vote.controller';
import { MeetingsVoteService } from './meetings.vote.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from 'src/entity/vote.entity';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { Meeting } from 'src/entity/meeting.entity';
import { VoteChoice } from 'src/entity/voteChoice.entity';
import { VoteChoiceMember } from 'src/entity/voteChoiceMember.entity';
import { MeetingMember } from 'src/entity/meetingMember.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vote,
      Meeting,
      MeetingDate,
      MeetingMember,
      VoteChoiceMember,
    ]),
  ],
  controllers: [MeetingsVoteController],
  providers: [MeetingsVoteService],
})
export class MeetingsVoteModule {}
