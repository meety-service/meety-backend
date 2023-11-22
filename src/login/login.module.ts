import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/entity/member.entity';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/common/exception-filter/http-exception.filter';

@Module({
  controllers: [LoginController],
  imports: [TypeOrmModule.forFeature([Member])],
  providers: [
    LoginService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class LoginModule {}
