import {
  Controller,
  Delete,
  Get,
  Req,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get()
  login(@Req() request: Request): Promise<Response> {
    const success = this.loginService.login(request);
    return success;
  }
}
