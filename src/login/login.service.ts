import { Injectable } from '@nestjs/common';
import {
  GoogleAuthRes,
  RefreshGoogleAuthRes,
  UserId,
} from './google/googleAuth';
import { json } from 'stream/consumers';
import { JsonContains, NoNeedToReleaseEntityManagerError } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from 'src/entity/member.entity';
import { IsNumber, isNumber } from 'class-validator';
import { getMemberId, parseToken } from 'src/util';

const cookieName = 'X-Gapi-Refresh-Token'; //클라이언트는 쿠키에 해당 이름을 가지는 필드에 토큰을 저장하여 서버로 전송한다.

const url = 'https://oauth2.googleapis.com/token'; // google oauth server

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Member)
    private readonly members: Repository<Member>,
  ) {}
  async login(request: Request) {
    const code = new URL(`${process.env.URL}${request.url}`).searchParams.get(
      'code',
    );

    const { status } = await this.refresh(request);

    if (status == 200) {
      //already logged in

      return { status: 200 };
    }

    const bodyObject = {
      code,
      client_id: process.env.NEXT_PUBLIC_GAPI_CLIENT_ID,
      client_secret: process.env.GAPI_CLIENT_SECRET,
      redirect_uri: `${process.env.URL}/login`,
      grant_type: 'authorization_code',
    };
    const body = JSON.stringify(bodyObject);

    const options = {
      method: 'POST',
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      body,
    };

    const res = await fetch(url, options);

    if (!res.ok) {
      console.log('google server login request fail');
      return { status: res.status };
    }

    const data = await res.json();
    const refreshToken = (data as GoogleAuthRes).refresh_token;
    const accessToken = (data as GoogleAuthRes).access_token;
    const id_token_string = await data.id_token
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .split('.')
      .map((a) => atob(a));

    let email;
    try {
      email = JSON.parse(id_token_string[1]).email;
    } catch (e) {
      //구글 응답에 email이 포함되지 않음... 등
      console.log('google server login response error');
      return { status: 500 };
    }

    //이메일이 데이터베이스 유저 테이블에 존재하는지 확인하고, 없다면 유저를 신규 등록해야 함
    const member = await this.members.findOne({ where: { email } });
    try {
      if (!member) {
        const memberRegisterResult = await this.members.insert({
          token: 'not used',
          email: email,
        });
      }
    } catch (e) {
      console.log(e, 'db member register error');
    }

    return {
      cookieName,
      refreshToken,
    };
  }

  async refresh(request: Request) {
    const token = parseToken(request.headers);
    if (!token) return { status: 401 }; //토큰이 없으므로 로그인되지 않은 상태

    const memberId = await getMemberId(token);

    if (!memberId.email) {
      return { status: 500 }; //구글 서버 에러
    }

    if (!(await this.members.findOne({ where: { email: memberId.email } }))) {
      return { status: 401 }; // 에러: 구글 인증은 되지만 login 정보 찾을수 없음
    }

    return { status: 200 };
    //200:로그인 된 상태로 정상 응답, 401:쿠키 없음(로그인되지 않은 상태), 500:에러
  }

  async withdraw(request: Request) {
    const token = parseToken(request.headers);

    if (!token) return { status: 401 }; // 401 : token이 없는 경우(로그인되지 않았는데 회원 탈퇴 요청)

    const memberId = await getMemberId(token);

    if (!memberId.email) return { status: 500 }; // 500 : token은 있지만 구글 요청이 제대로 되지 않음.. 만료된 토큰인지 요청이 실패했는지 구분 불가

    await this.members.update(
      { email: memberId.email },
      { email: null, token: null },
    ); // 탈퇴 시 멤버 테이블에서 개인정보를 모두 지움

    return { status: 200 };
  }
}

const SCOPES = ['https://www.googleapis.com/auth/userinfo.email'];
export const GoogleAuthAccessURL = (() => {
  const accessurl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  // eslint-disable-next-line prettier/prettier
  accessurl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GAPI_CLIENT_ID!);
  accessurl.searchParams.set('redirect_uri', `${process.env.URL}/login`);
  accessurl.searchParams.set('response_type', 'code');
  accessurl.searchParams.set('scope', SCOPES.join(' '));
  accessurl.searchParams.set('access_type', 'offline');
  accessurl.searchParams.set('prompt', 'consent');
  return accessurl.toString();
})();
//이 주소로 요청하면 구글 로그인 연동 창이 나오고 로그인을 완료하면 로그인 주소로 리디렉션됨.
