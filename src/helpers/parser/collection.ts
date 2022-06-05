import { instanceOfFolder, LocalCollection } from '@pm-types/local';
import { CollectionDetails } from '@pm-types/postman';
import { parseAuthToLocal, parseAuthToPostman } from '@helpers/parser/auth';
import {
  parseEventsToLocal,
  parseEventToPostman,
} from '@helpers/parser/events';
import { parseFolderToPostman, parseItemToLocal } from '@helpers/parser/item';
import {
  parseVariablesToLocal,
  parseVariableToPostman,
} from '@helpers/parser/variables';

export function parseCollectionToLocal(
  value: CollectionDetails
): LocalCollection {
  const localCollection: LocalCollection = {
    name: value.info.name,
    itens: {},
  };

  if (value.variable?.length) {
    localCollection.variables = parseVariablesToLocal(value.variable);
  }

  if (value.auth) {
    localCollection.auth = parseAuthToLocal(value.auth);
  }

  if (value.event?.length) {
    localCollection.itens = parseEventsToLocal(value.event);
  }

  for (const itemValue of value.item) {
    const { name, item } = parseItemToLocal(itemValue);
    localCollection.itens[name] = item;
  }

  return localCollection;
}

export function parseCollectionToPostman(
  value: LocalCollection
): CollectionDetails {
  const collection: CollectionDetails = {
    info: {
      name: value.name,
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
    event: [],
  };

  if (value.auth) {
    collection.auth = parseAuthToPostman(value.auth);
  }

  if (value.variables) {
    collection.variable = value.variables.variables.map(parseVariableToPostman);
  }

  for (const itemName in value.itens) {
    const item = value.itens[itemName];
    if (typeof item === 'string') {
      const event = parseEventToPostman(itemName, item);
      if (!event) {
        continue;
      }
      collection.event = collection.event || [];
      collection.event.push(event);
    } else if (instanceOfFolder(item)) {
      collection.item.push(parseFolderToPostman(itemName, item));
    }
  }

  return collection;
}
