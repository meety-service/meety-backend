import { IsArray, IsNumber, IsString } from 'class-validator';
import { AvailableDate } from './availableDate.dto';

export class MeetingDto {
  @IsString({ message: '미팅 이름을 설정해주세요.' })
  name: string;

  @IsArray({ message: '선택지를 하나 이상 추가하세요.' })
  available_dates: AvailableDate[];
  
  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsNumber()
  timezone_id: number;
}
