import { Injectable } from '@nestjs/common';
import { GoogleAuthRes, RefreshGoogleAuthRes } from './google/googleAuth';
import { json } from 'stream/consumers';
import { JsonContains } from 'typeorm';

const cookieName = 'X-Gapi-Refresh-Token'; //클라이언트는 쿠키에 해당 이름을 가지는 필드에 토큰을 저장하여 서버로 전송한다.

const url = 'https://oauth2.googleapis.com/token'; // google oauth server

@Injectable()
export class LoginService {
  async login(request: Request) {
    const code = new URL(`${process.env.URL}${request.url}`).searchParams.get(
      'code',
    );

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
    try {
      const email = JSON.parse(id_token_string[1]).email;
    } catch (e) {
      //구글 응답에 email이 포함되지 않음... 등
      return { status: 500 };
    }

    //TODO
    //이메일이 데이터베이스 유저 테이블에 존재하는지 확인하고, 없다면 유저를 신규 등록해야 함

    return {
      cookieName,
      refreshToken,
    };
  }

  async refresh(request: Request) {
    const cookie =
      request.headers.get('cookie') || request.headers.get('Cookie'); //쿠키로 클라이언트로부터 코드 전달받기

    if (!cookie || !cookie.includes(`${cookieName}=`))
      return new Response('No cookie', { status: 401 });

    const token = cookie
      .split(';')
      .map((c) => c.trim().split('='))
      .find((c) => c[0] === cookieName)[1];

    const bodyObject = {
      refresh_token: token,
      client_id: process.env.NEXT_PUBLIC_GAPI_CLIENT_ID,
      client_secret: process.env.GAPI_CLIENT_SECRET,
      grant_type: 'refresh_token',
    };

    const body = JSON.stringify(bodyObject);
    const options = {
      method: 'POST',
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      body,
    };
    const res = await fetch(url, options); // 구글 oauth서버에서 access_token, id_token을 요청

    if (!res.ok) return new Response('Error', { status: res.status });

    const data = await res.json();
    const accessToken = (data as RefreshGoogleAuthRes).access_token;

    const id_token_string = await data.id_token
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .split('.')
      .map((a) => atob(a));
    try {
      const email = JSON.parse(id_token_string[1]).email;
    } catch (e) {
      //구글 응답에 email이 포함되지 않음... 등
      console.log(e);
      return new Response('Error', { status: 500 });
    }

    const response = new Response(accessToken);

    //구글에 요청해서 사용자 구별 정보 받아오기
    //등록되어 있지 않은 경우에 디비에 저장
    //

    //email이 디비에 있는지 확인
    //있으면 그냥 로그인
    //없으면 가입절차 (디비에 넣어주기)
    return response;
    //200:로그인 된 상태로 정상 응답, 401:쿠키 없음(로그인되지 않은 상태), 500:에러
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GAPI_CLIENT_ID;

const SCOPES = ['https://www.googleapis.com/auth/userinfo.email'];

export const GoogleAuthAccessURL = (() => {
  const accessurl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  accessurl.searchParams.set('client_id', CLIENT_ID!);
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
