import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from 'src/entity/vote.entity';
import { Repository } from 'typeorm';
import { CreateVoteDto, FetchVoteDto, VoteChoiceRes } from './dto/vote.dto';
import { VoteChoice } from 'src/entity/voteChoice.entity';
import { Meeting } from 'src/entity/meeting.entity';
import { EntityDuplicatedException, EntityNotFoundException, InvalidRequestException } from 'src/common/exception/service.exception';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { VoteChoiceMember } from 'src/entity/voteChoiceMember.entity';

@Injectable()
export class MeetingsVoteService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,

    @InjectRepository(MeetingDate)
    private readonly meetingDateRepository: Repository<MeetingDate>,
    
    @InjectRepository(VoteChoiceMember)
    private readonly voteChoiceMemberRepository: Repository<VoteChoiceMember>,
  
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

  async fetchVote(meeting_id : number){
    const meeting = await this.meetingRepository.findOne({where:{id:meeting_id}, relations:['meeting_members']});
    const vote = await this.voteRepository.findOne({where:{meeting_id:meeting_id}, relations:['vote_choices']})


    //미팅이 없는 경우
    if (!meeting) {
      throw EntityNotFoundException('미팅을 찾을 수 없습니다');
    }

    //투표가 없는 경우
    if (!vote){
      throw EntityNotFoundException('투표를 찾을 수 없습니다');
    }

    const fetchVote = new FetchVoteDto();

    //1. 미팅 전체 참여자수 조회
    fetchVote.members = meeting.meeting_members.length;

    //2. 투표 참여자수 조회
    
    fetchVote.participants = (await this.voteRepository.query(`SELECT * FROM vote_choice
    JOIN vote_choice_member ON vote_choice_member.vote_choice_id = vote_choice.id
    WHERE vote_choice. vote_id = ?
    GROUP BY vote_choice_member.member_id;`, [vote.id])).length;

    //3. 투표 마감여부 조회
    fetchVote.close = vote.close;

    //4. 투표선택지들 조회 및 최대득표 계산
    let max_count=0;
    let max_choice_id=[];
    fetchVote.vote_choices = await Promise.all(vote.vote_choices.map(async (choice)=>{
      let resChoice = new VoteChoiceRes();
      resChoice.id = choice.id;
      resChoice.date = (await this.meetingDateRepository.findOne({where:{'id': choice.meeting_date_id}})).available_date;
      resChoice.start_time = choice.start_time;
      resChoice.end_time = choice.end_time;
      resChoice.count = (await this.voteChoiceMemberRepository.find({where:{'vote_choice_id' : choice.id}})).length;
      
      //최대득표갱산
      if(resChoice.count > max_count){
        max_count = resChoice.count;
        max_choice_id = [choice.id];
      }else if(resChoice.count == max_count){
        max_choice_id.push(choice.id);
      }

      return resChoice;
    }));
    
    //5. 최다득표선택지들 조회
    fetchVote.largest_choices = fetchVote.vote_choices.filter((choice)=>{
      return max_choice_id.includes(choice.id);
    })

    //6. 로그인유저가 선택한 투표선택지 id 조회
    
    //TODO 로그인 멤버의 id 조회
    const member_id = 1;
    fetchVote.user_choices = (await this.voteChoiceMemberRepository.find({where:{'member_id' : member_id}}))
                .map((vote_choice)=>{
                  return {id : vote_choice.vote_choice_id};
                });
    return fetchVote;
  }

}
