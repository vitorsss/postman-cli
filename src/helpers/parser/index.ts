import { LocalCollection } from '@pm-types/local';
import { CollectionDetails } from '@pm-types/postman';
import { parseAuthToLocal } from '@helpers/parser/auth';
import { parseEventsToLocal } from '@helpers/parser/events';
import { parseItemToLocal } from '@helpers/parser/item';
import { parseVariablesToLocal } from '@helpers/parser/variables';

export function parseCollectionToLocal(
  value: CollectionDetails
): LocalCollection {
  const localCollection: LocalCollection = {
    name: value.info.name,
    itens: {},
  };

  if (value.variable) {
    localCollection.variables = parseVariablesToLocal(value.variable);
  }

  if (value.auth) {
    localCollection.auth = parseAuthToLocal(value.auth);
  }

  if (value.event) {
    localCollection.itens = parseEventsToLocal(value.event);
  }

  for (const itemValue of value.item) {
    const { name, item } = parseItemToLocal(itemValue);
    localCollection.itens[name] = item;
  }

  return localCollection;
}
