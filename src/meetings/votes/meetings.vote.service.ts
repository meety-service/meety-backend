import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from 'src/entity/vote.entity';
import { Repository } from 'typeorm';
import { CreateVoteDto, FetchVoteDto, VoteChoiceRes, VoteCloseDto } from './dto/vote.dto';
import { VoteChoice } from 'src/entity/voteChoice.entity';
import { Meeting } from 'src/entity/meeting.entity';
import { EntityDuplicatedException, EntityNotFoundException, InvalidRequestException, NoRightException } from 'src/common/exception/service.exception';
import { MeetingDate } from 'src/entity/meetingDate.entity';
import { VoteChoiceMember } from 'src/entity/voteChoiceMember.entity';
import { UserChoiceDto } from './dto/vote.choice.dto';
import { MeetingMember } from 'src/entity/meetingMember.entity';
import { getMemberId, parseToken } from 'src/util';
import { Member } from 'src/entity/member.entity';

@Injectable()
export class MeetingsVoteService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    
    @InjectRepository(MeetingMember)
    private readonly meetingMemberRepository: Repository<MeetingMember>,

    @InjectRepository(MeetingDate)
    private readonly meetingDateRepository: Repository<MeetingDate>,
    
    @InjectRepository(VoteChoiceMember)
    private readonly voteChoiceMemberRepository: Repository<VoteChoiceMember>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  
  ) {}
  
  async createVote(meeting_id : number, createVoteDto : CreateVoteDto, req : Request){
    //TODO 로그인 유저 id받기
    const token = parseToken(req.headers);

    if (!token){//토큰이 없으므로 로그인되지 않은 상태
      throw NoRightException('로그인이 필요한 서비스입니다.');
    } 
    
    const memberEmail = (await getMemberId(token)).email;
    const user = await this.memberRepository.findOne({where:{email:memberEmail}});

    if (!user){
      throw NoRightException('잘못된 회원정보입니다.');
    } 

    const user_id = user.id;

    const vote = new Vote();
    
    const meeting = await this.meetingRepository.findOne({where:{id:meeting_id}, relations: ['meeting_dates']});
    if (!meeting) {
      throw EntityNotFoundException('미팅을 찾을 수 없습니다');
    }
    
    if(await this.voteRepository.findOne({where:{meeting_id:meeting.id}})){
      throw EntityDuplicatedException('이미 존재하는 투표입니다');     
    }
    
    if(meeting.member_id != user_id){
      throw NoRightException('방장 외에는 투표생성이 불가능합니다');
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
    
    //user_state갱신
    await this.meetingMemberRepository.update({meeting_id:meeting_id},{user_state:2});

  }

  async fetchVote(meeting_id : number, req: Request){
    //TODO 로그인 멤버의 id 조회
    const token = parseToken(req.headers);

    if (!token){//토큰이 없으므로 로그인되지 않은 상태
      throw NoRightException('로그인이 필요한 서비스입니다.');
    } 
    
    const memberEmail = (await getMemberId(token)).email;
    const user = await this.memberRepository.findOne({where:{email:memberEmail}});

    if (!user){
      throw NoRightException('잘못된 회원정보입니다.');
    } 

    const user_id = user.id;

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
    
    fetchVote.participants = (await this.voteRepository.query(`SELECT vote_choice_member.member_id FROM vote_choice
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

    const hasRight = this.meetingMemberRepository.findOne({where : {meeting_id : meeting_id, member_id : user_id}});
    if(!hasRight){
      throw NoRightException('해당 미팅에 참여한 멤버만 접근할 수 있습니다');
    }

    fetchVote.user_choices = (await this.voteChoiceMemberRepository.find({where:{'member_id' : user_id}}))
                .map((vote_choice)=>{
                  return {id : vote_choice.vote_choice_id};
                }).filter((vote_choice)=>{
                  return vote.vote_choices.find(v => v.id == vote_choice.id);
                });
    return fetchVote;
  }

  async createUserChoice(meeting_id : number, userChoiceDto : UserChoiceDto, req : Request){
    //TODO user_id 받아오기
    const token = parseToken(req.headers);

    if (!token){//토큰이 없으므로 로그인되지 않은 상태
      throw NoRightException('로그인이 필요한 서비스입니다.');
    } 
    
    const memberEmail = (await getMemberId(token)).email;
    const user = await this.memberRepository.findOne({where:{email:memberEmail}});

    if (!user){
      throw NoRightException('잘못된 회원정보입니다.');
    } 

    const user_id = user.id;

    const meeting = await this.meetingRepository.findOne({where:{id:meeting_id}});
    if (!meeting) {
      throw EntityNotFoundException('미팅을 찾을 수 없습니다');
    }
    
    const vote = await this.voteRepository.findOne({where:{meeting_id:meeting.id}});
    if(!vote){
      throw EntityNotFoundException('투표를 찾을 수 없습니다');    
    }

    //투표 참여 권한이 없을 때 예외처리
    const hasRole = (await this.meetingRepository.findOne({where:{id:meeting_id}, relations:['meeting_members']}))
                .meeting_members.find((member)=>{return member.member_id == user_id;});
    
    if(!hasRole){
      throw NoRightException('투표 참여 권한이 없습니다');
    }

    //이미 마감된 투표일 때 예외처리
    if(vote.close){
      throw InvalidRequestException('이미 마감된 투표입니다');
    }

    //올바른 투표선택지 id가 아닐 때 예외처리
    const vote_choices = (await this.voteRepository.findOne({where:{meeting_id:meeting_id}, relations:['vote_choices']})).vote_choices;
    userChoiceDto.vote_choices.forEach((user_choice)=>{
      const isValid = vote_choices.find((vote_choice)=>{return vote_choice.id == user_choice.id;});
      if(!isValid){
        throw InvalidRequestException('선택한 투표선택지는 올바르지 않은 대상입니다.');
      }
    })

    //이미 참여한 투표일때 예외처리
    const user_choices =  await this.voteChoiceMemberRepository.query(`SELECT * FROM vote_choice
        JOIN vote_choice_member ON vote_choice.id = vote_choice_member.vote_choice_id
        WHERE vote_choice.vote_id = ? AND vote_choice_member.member_id = ?;`,
        [vote.id, user_id]);
    

    if(user_choices?.length){
      throw EntityDuplicatedException('이미 투표한 유저입니다.');
    }

    //투표 저장하기
    userChoiceDto.vote_choices.forEach(async (user_choice)=>{
      await this.voteChoiceMemberRepository.save({vote_choice_id: user_choice.id, member_id:user_id});
    })

    //user state갱신
    await this.meetingMemberRepository.update({meeting_id:meeting_id, member_id:user_id}, {user_state:3});
    
  }


  async updateUserChoice(meeting_id : number, userChoiceDto : UserChoiceDto, req : Request){
    //TODO user_id 받아오기
    const token = parseToken(req.headers);

    if (!token){//토큰이 없으므로 로그인되지 않은 상태
      throw NoRightException('로그인이 필요한 서비스입니다.');
    } 
    
    const memberEmail = (await getMemberId(token)).email;
    const user = await this.memberRepository.findOne({where:{email:memberEmail}});

    if (!user){
      throw NoRightException('잘못된 회원정보입니다.');
    } 

    const user_id = user.id;

    const meeting = await this.meetingRepository.findOne({where:{id:meeting_id}});
    if (!meeting) {
      throw EntityNotFoundException('미팅을 찾을 수 없습니다');
    }
    
    const vote = await this.voteRepository.findOne({where:{meeting_id:meeting.id}});
    if(!vote){
      throw EntityNotFoundException('투표를 찾을 수 없습니다');    
    }

    //투표 참여 권한이 없을 때 예외처리
    const hasRole = (await this.meetingRepository.findOne({where:{id:meeting_id}, relations:['meeting_members']}))
                .meeting_members.find((member)=>{return member.member_id == user_id;});
    
    if(!hasRole){
      throw NoRightException('투표 참여 권한이 없습니다');
    }

    //이미 마감된 투표일 때 예외처리
    if(vote.close){
      throw InvalidRequestException('이미 마감된 투표입니다');
    }

    //올바른 투표선택지 id가 아닐 때 예외처리
    const vote_choices = (await this.voteRepository.findOne({where:{meeting_id:meeting_id}, relations:['vote_choices']})).vote_choices;
    userChoiceDto.vote_choices.forEach((user_choice)=>{
      const isValid = vote_choices.find((vote_choice)=>{return vote_choice.id == user_choice.id;});
      if(!isValid){
        throw InvalidRequestException('선택한 투표선택지는 올바르지 않은 대상입니다.');
      }
    })

    //이전 투표 지우기

    const vote_choices_id = vote_choices.map((choice)=>{return choice.id});

    await this.voteChoiceMemberRepository
      .createQueryBuilder()
      .delete()
      .from(VoteChoiceMember)
      .where("member_id = :memberId", { memberId: user_id })
      .andWhere("vote_choice_id IN (:voteChoiceIds)", { voteChoiceIds: vote_choices_id })
      .execute();
    

    //투표 저장하기
    userChoiceDto.vote_choices.forEach(async (user_choice)=>{
      await this.voteChoiceMemberRepository.save({vote_choice_id: user_choice.id, member_id:user_id});
    })

  }

  async closeVote(meeting_id : number, voteCloseDto : VoteCloseDto, req : Request){
    //TODO user_id 받아오기
    const token = parseToken(req.headers);

    if (!token){//토큰이 없으므로 로그인되지 않은 상태
      throw NoRightException('로그인이 필요한 서비스입니다.');
    } 
    
    const memberEmail = (await getMemberId(token)).email;
    const user = await this.memberRepository.findOne({where:{email:memberEmail}});

    if (!user){
      throw NoRightException('잘못된 회원정보입니다.');
    } 

    const user_id = user.id;

    const meeting = await this.meetingRepository.findOne({where:{id:meeting_id}});
    if (!meeting) {
      throw EntityNotFoundException('미팅을 찾을 수 없습니다');
    }
    
    const vote = await this.voteRepository.findOne({where:{meeting_id:meeting.id}});
    if(!vote){
      throw EntityNotFoundException('투표를 찾을 수 없습니다');    
    }

    if(meeting.member_id != user_id){
      throw NoRightException('방장 외에는 투표마감이 불가능합니다');
    }

    await this.voteRepository.update({meeting_id: meeting_id},{close : voteCloseDto.close});

    //user_state갱신
    if(voteCloseDto.close){
      await this.meetingMemberRepository.update({meeting_id: meeting_id},{user_state:4});
    }
  }

}
