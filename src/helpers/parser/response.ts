import { Response, schemas } from '@pm-types/local';
import { Response as PMResponse } from '@pm-types/postman';
import { parseCookieToLocal } from '@helpers/parser/cookie';
import { parseHeaderToLocal } from '@helpers/parser/header';
import { parseRequestToLocal } from '@helpers/parser/request';

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

  if (value.header) {
    response.header = parseHeaderToLocal(value.header);
  }

  if (value.cookie) {
    response.cookie = value.cookie.map(parseCookieToLocal);
  }

  return {
    name,
    response,
  };
}
