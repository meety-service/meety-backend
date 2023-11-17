import { Injectable } from '@nestjs/common';

@Injectable()
export class MeetingsService {
  getHelloWorld(): string {
    return 'Hello World!!';
  }
}
