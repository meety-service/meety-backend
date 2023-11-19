import { Type } from "class-transformer";
import { IsNotEmpty, IsString, Matches, ArrayMinSize, ValidateNested } from "class-validator";

export class CreateVoteDto {
    @IsNotEmpty({
        message: "선택지를 하나 이상 추가하세요",
    })
    @ValidateNested({ each: true })
    @ArrayMinSize(1, {
        message: "선택지를 하나 이상 추가하세요."
    })
    @Type(() => VoteChoice)
    vote_choices: VoteChoice[];
}

export class VoteChoice {
    @Matches(/^\d{4}-\d{2}-\d{2}$/,{
        message: "올바른 형식의 날짜를 입력해주세요.",
    })
    date: string;

    @IsNotEmpty({
        message : "해당 날짜에 지정된 시간이 없습니다.",
        each:true
    })
    @ValidateNested({ each: true })
    @Type(() => TimeRange)
    times: TimeRange[];
}
  
export class TimeRange {
    @Matches(/^\d{2}:\d{2}:\d{2}$/,{
        message: "올바른 형식의 시간을 입력해주세요."
    })
    start_time: string;

    @Matches(/^\d{2}:\d{2}:\d{2}$/,{
        message: "올바른 형식의 시간을 입력해주세요."
    })
    end_time: string;
}