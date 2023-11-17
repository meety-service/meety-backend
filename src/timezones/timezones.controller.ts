import { Controller, Get } from '@nestjs/common';
import { TimezonesService } from './timezones.service';

@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  @Get()
  getHelloWorld(): string {
    return this.timezonesService.getHelloWorld();
  }
}