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

    console.log('login try' + request.headers);

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
      console.log('google server request fail');
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
      console.log('google server response error');
      return { status: 500 };
    }
    console.log(email);
    //TODO
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

    console.log('login success');
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
      return { status: 500 }; // 에러: 구글 인증은 되지만 login 정보 찾을수 없음
    }

    return { status: 200 };
    //200:로그인 된 상태로 정상 응답, 401:쿠키 없음(로그인되지 않은 상태), 500:에러
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

// https://accounts.google.com/o/oauth2/v2/auth?client_id=129605054816-l0haa5863jbvm7tcv7tr97gqq5ikrh52.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%2Flogin&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&access_type=offline&prompt=consent
/* 
http://localhost/login?
code=4/0AfJohXlcc8TtBzp5tBaS_X4le6YUg2tCevbu24P9sfJR3nwerfsnE1quO2UCTnEdiROTCA
&scope=email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid&authuser=0
&prompt=consent#

http://localhost/login?code=4%2F0AfJohXlcc8TtBzp5tBaS_X4le6YUg2tCevbu24P9sfJR3nwerfsnE1quO2UCTnEdiROTCA&scope=email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid&authuser=0&prompt=consent#

const googleEmailRequest = async (accessToken: string) => {
  const url = 'https://www.googleapis.com/auth/userinfo#email';
  const options = { headers: { Authorization: `Bearer ${accessToken}` } };

  const email = await fetch(url, options);
};
*/
