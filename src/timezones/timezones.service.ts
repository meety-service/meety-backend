import { Injectable } from '@nestjs/common';

@Injectable()
export class TimezonesService {
  getHelloWorld(): string {
    return 'Hello World!!';
  }
}
