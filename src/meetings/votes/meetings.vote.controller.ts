import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MeetingsVoteService } from './meetings.vote.service';
import { CreateVoteDto, FetchVoteDto } from './dto/vote.dto';
import { UserChoiceDto } from './dto/vote.choice.dto';

@Controller('meetings/:id/vote')
export class MeetingsVoteController {
  constructor(private readonly meetingsVoteService: MeetingsVoteService) {}
  
  @Post()
  createVote(@Param('id') meeting_id: number, @Body() createVoteDto: CreateVoteDto){
    return this.meetingsVoteService.createVote(meeting_id, createVoteDto);
  }

  @Get()
  fetchVote(@Param('id') meeting_id: number){
    return this.meetingsVoteService.fetchVote(meeting_id);
  }

  @Post('/choice')
  createUserChoice(@Param('id') meeting_id: number, @Body() userChoiceDto: UserChoiceDto){
    return this.meetingsVoteService.createUserChoice(meeting_id, userChoiceDto);
  }

}