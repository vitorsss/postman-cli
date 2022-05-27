import { LocalCollection } from "@pm-types/local";
import { dump } from 'js-yaml';

export async function saveLocalCollection(
  collection: LocalCollection
): Promise<void> {
  console.log(dump(collection, {
    noRefs: true,
    sortKeys: true,
    lineWidth: 4000,
  }));
}
