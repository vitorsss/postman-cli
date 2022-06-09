import { Configs } from '@pm-types/cmd';
import { Folder, LocalCollection } from '@pm-types/local';
import { existsSync } from 'fs';
import path from 'path';
import { saveFolder, loadFolder } from '@helpers/local/folder';
import { saveVariables, loadVariables } from '@helpers/local/variables';

export async function saveLocalCollection(
  options: Configs,
  collection: LocalCollection
): Promise<void> {
  const dir: string = path.join(options.workdir, 'collections');

  await saveFolder(dir, collection.name, collection);

  if (collection.variables) {
    await saveVariables(path.join(dir, collection.name), collection.variables);
  }
}

export async function loadLocalCollection(
  options: Configs,
  name: string
): Promise<LocalCollection | undefined> {
  const dir: string = path.join(options.workdir, 'collections');
  const collectionDir: string = path.join(dir, name);

  if (!existsSync(collectionDir)) {
    return;
  }

  const collectionsFolder: Folder = await loadFolder(dir, name);

  const collection: LocalCollection = {
    ...collectionsFolder,
    name,
  };

  if (existsSync(path.join(collectionDir, 'variables.yaml'))) {
    collection.variables = await loadVariables(collectionDir);
  }

  return collection;
}
