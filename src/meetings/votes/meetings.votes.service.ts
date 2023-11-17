import { Injectable } from '@nestjs/common';

@Injectable()
export class MeetingsVoteService {
  getHelloWorld(id : number): string {
    return 'Hello World!!' + id;
  }
  postHelloWorld(): string {
    return 'Hello World?'
  }
}
