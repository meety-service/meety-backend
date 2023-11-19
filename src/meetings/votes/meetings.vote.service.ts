import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from 'src/entity/vote.entity';
import { Repository } from 'typeorm';
import { CreateVoteDto } from './dto/vote.dto';
import { VoteChoice } from 'src/entity/voteChoice.entity';
import { Meeting } from 'src/entity/meeting.entity';
import { EntityDuplicatedException, EntityNotFoundException, InvalidRequestException } from 'src/common/exception/service.exception';

@Injectable()
export class MeetingsVoteService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
  
  ) {}
  
  async createVote(meeting_id : number, createVoteDto : CreateVoteDto){
    const vote = new Vote();

    const meeting = await this.meetingRepository.findOne({where:{id:meeting_id}, relations: ['meeting_dates']});
    if (!meeting) {
      throw EntityNotFoundException('미팅을 찾을 수 없습니다');
    }

    if(await this.voteRepository.findOne({where:{meeting_id:meeting.id}})){
      throw EntityDuplicatedException('이미 존재하는 투표입니다');     
    }

    vote.meeting_id = meeting.id;
    vote.close = 0;

    
    let voteChoices: VoteChoice[] = [];
    
    createVoteDto.vote_choices.map((choice) => {     
      //미팅 날짜 범위내에 있는 선택지인지 확인
      const meetingDate = meeting.meeting_dates.find(meetingDate => meetingDate.available_date == choice.date);
      
      console.log(meetingDate);
      if(!meetingDate){//meeting날짜 범위 밖일때
        throw InvalidRequestException('가능한 미팅 날짜 범위 밖입니다');
      }
      choice.times.map((time) => {
        const voteChoice = new VoteChoice();
        voteChoice.meeting_date_id = meetingDate.id;
        voteChoice.start_time = time.start_time;
        voteChoice.end_time = time.end_time;
        voteChoices.push(voteChoice);
      });
      
    });

    vote.vote_choices = voteChoices;

    await this.voteRepository.save(vote);

  }

  getHelloWorld(id : number): string {
    return 'Hello World!!' + id;
  }
  postHelloWorld(): string {
    return 'Hello World?'
  }

}
