import { Controller, Get, Post, Param, Body, Put, Patch, Req } from '@nestjs/common';
import { MeetingsVoteService } from './meetings.vote.service';
import { CreateVoteDto, FetchVoteDto, VoteCloseDto } from './dto/vote.dto';
import { UserChoiceDto } from './dto/vote.choice.dto';

@Controller('meetings/:id/vote')
export class MeetingsVoteController {
  constructor(private readonly meetingsVoteService: MeetingsVoteService) {}
  
  @Post()
  createVote(@Param('id') meeting_id: number, @Body() createVoteDto: CreateVoteDto, @Req() req : Request){
    return this.meetingsVoteService.createVote(meeting_id, createVoteDto, req);
  }

  @Get()
  fetchVote(@Param('id') meeting_id: number, @Req() req : Request){
    return this.meetingsVoteService.fetchVote(meeting_id, req);
  }

  @Post('/choice')
  createUserChoice(@Param('id') meeting_id: number, @Body() userChoiceDto: UserChoiceDto, @Req() req : Request){
    return this.meetingsVoteService.createUserChoice(meeting_id, userChoiceDto, req);
  }

  @Put('/choice')
  updateUserChoice(@Param('id') meeting_id: number, @Body() userChoiceDto: UserChoiceDto, @Req() req : Request){
    return this.meetingsVoteService.updateUserChoice(meeting_id, userChoiceDto, req);
  }

  @Patch()
  closeVote(@Param('id') meeting_id:number, @Body() voteCloseDto : VoteCloseDto, @Req() req : Request){
    return this.meetingsVoteService.closeVote(meeting_id,voteCloseDto, req);
  }

}