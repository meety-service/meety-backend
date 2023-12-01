import { UserId, RefreshGoogleAuthRes } from './login/google/googleAuth';

export function parseToken(headers: Headers) {
  const cookieName = 'X-Gapi-Refresh-Token';
  const cookie = headers['cookie'] || headers['Cookie']; //쿠키로 클라이언트로부터 코드 전달받기
  if (!cookie || !cookie.includes(`${cookieName}=`)) {
    return { status: 401 };
  }

  return cookie
    .split(';')
    .map((c) => c.trim().split('='))
    .find((c) => c[0] === cookieName)[1];
}

const url = 'https://oauth2.googleapis.com/token'; // google oauth server

export async function getMemberId(token: string): Promise<UserId> {
  // 입력으로 유저의 refresh token을 받아서 유저의 식별 정보를 UserId 자료형으로 리턴해주는 함수
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

  if (!res.ok) {
    console.log('refresh google response not ok');
    return {
      email: undefined,
    } as UserId;
  }

  const data = await res.json();
  const accessToken = (data as RefreshGoogleAuthRes).access_token;

  const id_token_string = await data.id_token
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .split('.')
    .map((a) => atob(a));
  const email = JSON.parse(id_token_string[1]).email;
  return {
    email,
  } as UserId;
}
