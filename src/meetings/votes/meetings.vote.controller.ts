import { Controller, Get, Post, Param } from '@nestjs/common';
import { MeetingsVoteService } from './meetings.votes.service';

@Controller('meetings/:id/vote')
export class MeetingsVoteController {
  constructor(private readonly meetingsVoteService: MeetingsVoteService) {}
  
  @Get()
  getHelloWorld(@Param('id') id: number): string {
    return this.meetingsVoteService.getHelloWorld(id);
  }
  
  // @Post()
  // postHelloWorld(): string {
  //   return this.meetingsVotesService.postHelloWorld();
  // }
}