import {
  Controller,
  Delete,
  Get,
  Req,
  Res,
  Headers,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { request } from 'http';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get()
  async login(@Req() req: Request, @Res() res) {
    const { cookieName, refreshToken, status } =
      await this.loginService.login(req);
    if (status) {
      //not okay status..

      if (status == 200) {
        return res.send(
          `<script>window.location.href = '${process.env.FRONTURL}'; </script>`,
        );
      }
      return res.sendStatus(status);
    }
    console.log('here?');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-origin', '*'); // 모든 출처(origin)을 허용
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    ); // 모든 HTTP 메서드 허용
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // 클라이언트와 서버 간에 쿠키 주고받기 허용
    res.setHeader(
      'Set-Cookie',
      `${cookieName}=${refreshToken}; Max-Age=315360000; Path=/;`, // HttpOnly;
    );
    return res.send(
      `<script>window.location.href = '${process.env.FRONTURL}'; </script>`,
    );
  }

  @Get('/refresh') // http://local/login/refresh
  async refresh(@Req() req: Request, @Res() res) {
    const { status } = await this.loginService.refresh(req);

    res.setHeader('Content-Type', 'text/html');
    return res.sendStatus(status);
  }
  @Get('/withdraw')
  async withdraw(@Req() req: Request, @Res() res) {
    const { status } = await this.loginService.withdraw(req);
    return res.sendStatus(status);
  }
}
