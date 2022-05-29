import { Cookie } from '@pm-types/local';
import { Cookie as PMCookie } from '@pm-types/postman';

export function parseCookieToLocal(value: PMCookie): Cookie {
  const cookie: Cookie = {
    domain: value.domain,
    path: value.path,
    expires: value.expires,
    extensions: value.extensions,
    hostOnly: value.hostOnly,
    httpOnly: value.httpOnly,
    maxAge: value.maxAge,
    name: value.name,
    secure: value.secure,
    session: value.session,
    value: value.value,
  };
  return cookie;
}

export function parseCookieToPostman(value: Cookie): PMCookie {
  const cookie: PMCookie = {
    domain: value.domain,
    path: value.path,
    expires: value.expires,
    extensions: value.extensions,
    hostOnly: value.hostOnly,
    httpOnly: value.httpOnly,
    maxAge: value.maxAge,
    name: value.name,
    secure: value.secure,
    session: value.session,
    value: value.value,
  };
  return cookie;
}
