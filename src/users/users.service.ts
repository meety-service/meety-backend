import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getHelloWorld(): string {
    return 'Hello World!!';
  }
}
