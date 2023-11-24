import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
export class TimeDto {
  @IsString()
  time: string;
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

export class AllScheduleMemberDto {
  @IsString()
  nickname: string;
}

export class AllScheduleTimeDto {
  @IsString()
  time: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllScheduleMemberDto)
  available: AllScheduleMemberDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllScheduleMemberDto)
  unavailable: AllScheduleMemberDto[];
}

export class AllScheduleDateDto {
  @IsString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllScheduleTimeDto)
  times: AllScheduleTimeDto[];
}

export class AllScheduleDto {
  @IsNumber()
  members: number;

  @IsArray()
  schedules: AllScheduleDateDto[];

  @IsNumber()
  user_state: number;
}
