import { Response, schemas } from '@pm-types/local';
import { Response as PMResponse } from '@pm-types/postman';
import { parseCookieToLocal, parseCookieToPostman } from '@helpers/parser/cookie';
import { parseHeaderToLocal, parseHeaderToPostman } from '@helpers/parser/header';
import { parseRequestToLocal, parseRequestToPostman } from '@helpers/parser/request';

export function parseResponseToLocal(value: PMResponse): {
  name: string;
  response: Response;
} {
  // @ts-ignore
  let name: string = value.name || '';
  const response: Response = {
    $schema: schemas.response,
    body: value.body || '',
    code: value.code || 0,
    status: value.status,
    originalRequest: parseRequestToLocal(value.originalRequest || {}),
  };

  if (value.header?.length) {
    response.header = parseHeaderToLocal(value.header);
  }

  if (value.cookie?.length) {
    response.cookie = value.cookie.map(parseCookieToLocal);
  }

  return {
    name,
    response,
  };
}

export function parseResponseToPostman(name: string, value: Response): PMResponse {
  const response: PMResponse = {
    body: value.body || '',
    code: value.code || 0,
    status: value.status,
    originalRequest: parseRequestToPostman(value.originalRequest || {}),
    name,
  };

  if (value.header?.length) {
    response.header = parseHeaderToPostman(value.header);
  }

  if (value.cookie?.length) {
    response.cookie = value.cookie.map(parseCookieToPostman);
  }

  return response;
}
