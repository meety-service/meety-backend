import { Module } from '@nestjs/common';
import { MeetingsVoteController } from './meetings.vote.controller';
import { MeetingsVoteService } from './meetings.vote.service';

@Module({
  controllers: [MeetingsVoteController],
  providers: [MeetingsVoteService],
})
export class MeetingsVoteModule {}
