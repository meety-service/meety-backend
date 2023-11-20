import { Type } from "class-transformer";
import { ArrayMinSize, IsInt, IsNotEmpty, ValidateNested } from "class-validator";

export class UserChoiceDto{
    @IsNotEmpty({
        message: "선택지를 최소한 하나 이상 선택하세요."
    })
    @ArrayMinSize(1, {
        message: "선택지를 최소한 하나 이상 선택하세요."
    })
    @ValidateNested({ each: true })
    @Type(() => VoteChoice)
    vote_choices: VoteChoice[];
}

export class VoteChoice {
    @IsInt({ message: "선택지 입력이 이상해요. 뭘 건드리고 계신거죠?" })
    id: number;
}