import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MeetingsVoteService } from './meetings.vote.service';
import { CreateVoteDto } from './dto/vote.dto';

@Controller('meetings/:id/vote')
export class MeetingsVoteController {
  constructor(private readonly meetingsVoteService: MeetingsVoteService) {}
  
  @Get()
  getHelloWorld(@Param('id') id: number): string {
    return this.meetingsVoteService.getHelloWorld(id);
  }
  
  @Post()
  createVote(@Param('id') meeting_id: number, @Body() createVoteDto: CreateVoteDto){
    return this.meetingsVoteService.createVote(meeting_id, createVoteDto);
  }

}