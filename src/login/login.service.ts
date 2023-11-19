import { Injectable } from '@nestjs/common';
import { GoogleAuthRes } from './google/googleAuth';

const cookieName = 'X-Gapi-Refresh-Token'; //클라이언트는 쿠키에 해당 이름을 가지는 필드에 토큰을 저장하여 서버로 전송한다.

@Injectable()
export class LoginService {
  async login(request: Request) {
    const cookie =
      request.headers.get('cookie') || request.headers.get('Cookie'); //쿠키로 클라이언트로부터 코드 전달받기

    if (!cookie || !cookie.includes(`${cookieName}=`))
      return new Response('No cookie', { status: 400 });

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
    const url = 'https://oauth2.googleapis.com/token'; // google oauth server
    const options = {
      method: 'POST',
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      body,
    };
    const res = await fetch(url, options); // 구글 oauth서버에서 access_token, id_token을 요청

    if (!res.ok) return new Response('Error', { status: res.status });

    const data = await res.json();
    const accessToken = (data as GoogleAuthRes).access_token;

    const response = new Response(accessToken);
    return response;
  }
}
