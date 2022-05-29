import { Request, schemas } from '@pm-types/local';
import { Request as PMRequest } from '@pm-types/postman';
import { parseBodyToLocal } from '@helpers/parser/body';
import { parseDescriptionToLocal } from '@helpers/parser/description';
import { parseHeaderToLocal } from '@helpers/parser/header';
import { parseUrlToLocal } from '@helpers/parser/url';

export function parseRequestToLocal(value: PMRequest): Request {
  if (typeof value === 'string') {
    throw Error('unmapped conversion from string to local request');
  }

  const request: Request = {
    $schema: schemas.request,
    url: parseUrlToLocal(value.url || ''),
    method: value.method,
  };

  if (value.description) {
    request.description = parseDescriptionToLocal(value.description);
  }

  if (value.body) {
    request.body = parseBodyToLocal(value.body);
  }

  if (value.header) {
    request.header = parseHeaderToLocal(value.header);
  }

  return request;
}
