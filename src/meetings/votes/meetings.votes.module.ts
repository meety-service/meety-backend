import { Module } from '@nestjs/common';
import { MeetingsVotesController } from './meetings.votes.controller';
import { MeetingsVotesService } from './meetings.votes.service';

@Module({
  controllers: [MeetingsVotesController],
  providers: [MeetingsVotesService],
})
export class MeetingsVotesModule {}
