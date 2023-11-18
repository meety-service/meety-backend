import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timezone } from 'src/entity/timezone.entity';
import { TimezoneDTO } from './timezoneDTO/timezones.dto';

@Injectable()
export class TimezonesService {
  constructor(
    //데코레이터를 꼭 넣어줘야 한다.
    @InjectRepository(Timezone) //속성생성
    private timezones: Repository<Timezone>,
  ) {}
  async getTimezones(): Promise<TimezoneDTO[]> {
    try {
      const timezoneArr = await this.timezones.find();
      const ret = timezoneArr.map((obj) => new TimezoneDTO(obj.id, obj.name));
      return ret;
    } catch (e) {
      return [];
    }
  }
}
