import { Parameter, URL as LocalURL, URLBase } from '@pm-types/local';
import { PMUrl1, QueryParam, Url as PMUrl } from '@pm-types/postman';
import {
  parseVariableToLocal,
  parseVariableToPostmanQueryParam,
} from '@helpers/parser/variables';

function parseRawUrlToLocal(value: string): LocalURL {
  let search: string = '';
  if (value.includes('?')) {
    [value, search] = value.split('?', 2);
  }
  if (search && search.includes('#/')) {
    let hash;
    [search, hash] = search.split('#/', 2);
    value = `${value}#/${hash}`;
  }

  const url: LocalURL = {
    base: value,
  };

  if (search) {
    url.query = search.split('&').map((param: string): Parameter => {
      const [key, value] = param.split('=');
      return {
        key,
        value,
      };
    });
  }
  return url;
}

function parseRawUrlToPostman(value: string): PMUrl1 {
  const url: PMUrl1 = {
    raw: value,
  };
  if (value.includes('://')) {
    [url.protocol, value] = value.split('://', 2);
  }
  if (value.includes('#/')) {
    [value, url.hash] = value.split('#/', 2);
    url.hash = `/${url.hash}`;
  }
  if (value.includes('?')) {
    let search: string;
    [value, search] = value.split('?', 2);
    url.query = search.split('&').map((param: string): QueryParam => {
      const [key, value] = param.split('=');
      return {
        key,
        value,
      };
    });
  }
  if (value.includes('/')) {
    [value, ...url.path] = value.split('/');
  }
  url.host = value;
  return url;
}

export function parseUrlToLocal(value: PMUrl): URLBase {
  if (typeof value === 'string') {
    let parsedURL = parseRawUrlToLocal(value);
    if (!parsedURL.query) {
      return value;
    }
    value = {
      raw: value,
    };
  }
  const url: LocalURL = parseRawUrlToLocal(value.raw || '');

  if (value.query) {
    url.query = value.query.map(parseVariableToLocal);
  }

  if (value.variable) {
    url.variable = value.variable.map(parseVariableToLocal);
  }

  return url;
}

export function parseUrlToPostman(value: URLBase): PMUrl {
  if (typeof value === 'string') {
    return value;
  }
  const url: PMUrl1 = parseRawUrlToPostman(value.base);

  if (value.query) {
    url.query = (url.query || []).concat(
      value.query.map(parseVariableToPostmanQueryParam)
    );
  }

  if (value.variable) {
    url.variable = value.variable.map(parseVariableToPostmanQueryParam);
  }

  return url;
}
