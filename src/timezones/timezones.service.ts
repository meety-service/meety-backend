import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timezone } from 'src/entity/timezone.entity';

class RetObject {
  id: number;
  name: string;
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}
@Injectable()
export class TimezonesService {
  constructor(
    //데코레이터를 꼭 넣어줘야 한다.
    @InjectRepository(Timezone) //속성생성
    private timezones: Repository<Timezone>,
  ) {}
  async getTimezones(): Promise<JSON> {
    try {
      const timezoneArr = await this.timezones.find();
      const ret = timezoneArr.map((obj) => new RetObject(obj.id, obj.name));
      return JSON.parse(JSON.stringify(ret));
    } catch (e) {
      return JSON.parse('[]');
    }
  }
}
