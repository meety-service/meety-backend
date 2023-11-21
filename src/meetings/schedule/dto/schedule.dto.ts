import { IsArray, IsString } from "class-validator";
export class TimeDto {
    @IsString()
    time: string
}

export class SelectTimetableDto {
    @IsString()
    date: string;

    @IsArray()
    times: TimeDto[];
}

export class ScheduleDto {
    @IsString()
    nickname: string;

    @IsArray()
    select_times: SelectTimetableDto[];
}