import { Controller, Get } from '@nestjs/common';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  getHelloWorld(): string {
    return this.meetingsService.getHelloWorld();
  }
}