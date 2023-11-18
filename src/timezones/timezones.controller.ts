import { Controller, Get } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { Timezone } from 'src/entity/timezone.entity';

@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  @Get()
  getTimezones(): Promise<Timezone[]> {
    return this.timezonesService.getTimezones();
  }
}
