import { Request, schemas } from '@pm-types/local';
import { Request as PMRequest } from '@pm-types/postman';
import { parseBodyToLocal, parseBodyToPostman } from '@helpers/parser/body';
import { parseDescriptionToLocal, parseDescriptionToPostman } from '@helpers/parser/description';
import { parseHeaderToLocal, parseHeaderToPostman } from '@helpers/parser/header';
import { parseUrlToLocal, parseUrlToPostman } from '@helpers/parser/url';

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

  if (value.header?.length) {
    request.header = parseHeaderToLocal(value.header);
  }

  return request;
}

export function parseRequestToPostman(value: Request): PMRequest {
  const request: PMRequest = {
    url: parseUrlToPostman(value.url || ''),
    method: value.method,
  };

  if (value.description) {
    request.description = parseDescriptionToPostman(value.description);
  }

  if (value.body) {
    request.body = parseBodyToPostman(value.body);
  }

  if (value.header?.length) {
    request.header = parseHeaderToPostman(value.header);
  }

  return request;
}
