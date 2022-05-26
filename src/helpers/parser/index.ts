import { CollectionDetails } from '@gen/postman/collection';
import { LocalCollection } from '@helpers/local';

export function parseCollectionToLocal(collectionDetails: CollectionDetails): LocalCollection {
  console.log(JSON.stringify(collectionDetails, undefined, '  '));

  const localCollection: LocalCollection = {
    itens: {}
  }

  return localCollection;
}
