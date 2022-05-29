import { Item } from '@pm-types/local';
import { Items } from '@pm-types/postman';
import { parseEventsToLocal } from '@helpers/parser/events';
import { parseRequestToLocal } from '@helpers/parser/request';
import { parseResponseToLocal } from '@helpers/parser/response';

export function parseItemToLocal(value: Items): {
  name: string;
  item: Item;
} {
  let name: string = value.name || '';
  const item: Item = {
    itens: {},
  };
  if (value.auth) {
    // @ts-ignore
    item.auth = parseAuthToLocal(value.auth);
  }
  if (value.request) {
    // @ts-ignore
    const request = parseRequestToLocal(value.request);
    item.request = request;
    if (value.event) {
      const itens = parseEventsToLocal(value.event);
      for (const name in itens) {
        if (name.includes('prerequest')) {
          request.prerequest = request.prerequest || [];
          request.prerequest.push({
            src: `./${name}`,
          });
        } else if (name.includes('test')) {
          request.test = request.test || [];
          request.test.push({
            src: `./${name}`,
          });
        }
        item.itens[name] = itens[name];
      }
    }
    if (value.response) {
      // @ts-ignore
      for (const pmResponse: PMResponse of value.response) {
        const { name, response } = parseResponseToLocal(pmResponse);
        item.itens[`${name}_response.yaml`] = response;
      }
    }
  } else {
    // @ts-ignore
    for (const itemValue: Items of value.item) {
      const { name, item: parsed } = parseItemToLocal(itemValue);
      item.itens[name] = parsed;
    }
  }
  return {
    name,
    item,
  };
}
