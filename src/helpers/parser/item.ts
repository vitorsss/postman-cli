import {
  Folder,
  instanceOfFolder,
  instanceOfResponse,
  Item,
} from '@pm-types/local';
import {
  Items,
  Auth as PMAuth,
  Request as PMRequest,
  Response as PMResponse,
  Item as PMItem,
  Folder as PMFolder,
} from '@pm-types/postman';
import { parseEventsToLocal, parseEventToPostman } from '@helpers/parser/events';
import {
  parseRequestToLocal,
  parseRequestToPostman,
} from '@helpers/parser/request';
import {
  parseResponseToLocal,
  parseResponseToPostman,
} from '@helpers/parser/response';
import { parseAuthToLocal, parseAuthToPostman } from '@helpers/parser/auth';

export function parseItemToLocal(value: Items): {
  name: string;
  item: Item;
} {
  let name: string = value.name || '';
  const item: Item = {
    itens: {},
  };
  if (value.auth) {
    item.auth = parseAuthToLocal(value.auth as PMAuth);
  }
  if (value.request) {
    const request = parseRequestToLocal(value.request as PMRequest);
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
      const pmResponses: PMResponse[] = value.response as PMResponse[];
      for (const pmResponse of pmResponses) {
        const { name, response } = parseResponseToLocal(pmResponse);
        item.itens[`${name}_response.yaml`] = response;
      }
    }
  } else {
    const pmItems: Items[] = value.item as Items[];
    for (const itemValue of pmItems) {
      const { name, item: parsed } = parseItemToLocal(itemValue);
      item.itens[name] = parsed;
    }
    if (value.event) {
      const itens = parseEventsToLocal(value.event);
      for (const name in itens) {
        item.itens[name] = itens[name];
      }
    }
  }
  return {
    name,
    item,
  };
}

export function parseFolderToPostman(name: string, value: Folder): Items {
  if (value.request) {
    const pmItem: PMItem = {
      name,
      request: parseRequestToPostman(value.request),
    };
    if (value.itens) {
      for (const itemName in value.itens) {
        const item = value.itens[itemName];
        if (itemName.endsWith('_response.yaml') && instanceOfResponse(item)) {
          pmItem.response = pmItem.response || [];
          pmItem.response.push(
            parseResponseToPostman(itemName.split('_response.yaml')[0], item)
          );
        } else if (typeof item === 'string') {
          const event = parseEventToPostman(itemName, item);
          if (!event) {
            continue;
          }
          pmItem.event = pmItem.event || [];
          pmItem.event.push(event);
        }
      }
    }
    return pmItem;
  }
  const folder: PMFolder = {
    name,
    item: [],
  };
  if (value.auth) {
    folder.auth = parseAuthToPostman(value.auth);
  }
  for (const itemName in value.itens) {
    const item = value.itens[itemName];
    if (typeof item === 'string') {
      const event = parseEventToPostman(itemName, item);
      if (!event) {
        continue;
      }
      folder.event = folder.event || [];
      folder.event.push(event);
    } else if (instanceOfFolder(item)) {
      folder.item.push(parseFolderToPostman(itemName, item));
    }
  }
  return folder;
}
