import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
