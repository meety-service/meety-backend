import { Controller, Get, Post } from '@nestjs/common';

@Controller('meetings.votes')
export class MeetingsVotesController {
  constructor(private readonly meetingsVotesService: MeetingsVotesService) {}

  @Get()
  getHelloWorld(): string {
    return this.meetingsVotesService.getHelloWorld();
  }
  
  @Post()
  postHelloWorld(): string {
    return this.meetingsVotesService.postHelloWorld();
  }
}