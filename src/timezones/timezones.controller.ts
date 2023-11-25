import { Controller, Get } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { TimezoneDTO } from './timezoneDTO/timezones.dto';

@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  @Get('')
  getTimezones(): Promise<TimezoneDTO[]> {
    console.log('get timezones');
    return this.timezonesService.getTimezones();
  }
}
