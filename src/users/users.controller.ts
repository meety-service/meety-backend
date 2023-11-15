import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getHelloWorld(): string {
    return this.usersService.getHelloWorld();
  }
}