import { Controller, Get } from '@nestjs/common';

@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  @Get()
  getHelloWorld(): string {
    return this.timezonesService.getHelloWorld();
  }
}