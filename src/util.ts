export function parseToken(headers: Headers) {
  const cookieName = 'X-Gapi-Refresh-Token';
  const cookie = headers['cookie'] || headers['Cookie']; //쿠키로 클라이언트로부터 코드 전달받기
  if (!cookie || !cookie.includes(`${cookieName}=`)) {
    console.log('cookie error', cookie);
    return { status: 401 };
  }

  return cookie
    .split(';')
    .map((c) => c.trim().split('='))
    .find((c) => c[0] === cookieName)[1];
}
