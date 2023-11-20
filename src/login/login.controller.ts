import {
  Controller,
  Delete,
  Get,
  Req,
  Res,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get()
  async login(@Req() req: Request, @Res() res) {
    const { cookieName, refreshToken, status } =
      await this.loginService.login(req);
    if (status) {
      return res.sendStatus(status);
    }
    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Set-Cookie',
      `${cookieName}=${refreshToken}; Max-Age=315360000; Path=/; Secure; HttpOnly;`,
    );
    return res.send('<script>window.close()</script>');
  }
}
