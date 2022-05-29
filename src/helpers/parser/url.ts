import { Parameter, URL as LocalURL, URLBase } from '@pm-types/local';
import { Url as PMUrl } from '@pm-types/postman';
import { parseVariableToLocal } from '@helpers/parser/variables';

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
