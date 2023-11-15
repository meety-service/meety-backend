import { Injectable } from '@nestjs/common';

@Injectable()
export class MeetingsVotesService {
  getHelloWorld(): string {
    return 'Hello World!!';
  }
  postHelloWorld(): string {
    return 'Hello World?'
  }
}
