import { Command } from 'commander';
import { existsSync } from 'fs';
import path from 'path';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
  selectWorkspaceCollections,
  mergeAndSaveConfig,
} from '@cmd/commons';
import { parseCollectionToLocal } from '@helpers/parser';
import { saveLocalCollection } from '@helpers/local';
import {
  CollectionsCheckoutArgs,
  CommandReg,
  CommonArgs,
  Configs,
} from '@pm-types/cmd';
import { Collection } from '@pm-types/postman';

export const checkout: CommandReg<CollectionsCheckoutArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: CollectionsCheckoutArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('checkout [name|id]')
    .description('Checkout an remote collection to local workdir');

  registerCommonArgs(cmd, commonDefaults);

  cmd.action(async function action(
    idName: string,
    options: CommonArgs & CollectionsCheckoutArgs
  ) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    const addedCollections: Record<string, string> = {};

    let collections: Collection[] = [];
    if (idName) {
      collections = workspace.collections.filter(
        (collection) => collection.id === idName || collection.name === idName
      );
    } else {
      collections = await selectWorkspaceCollections(
        workspace.collections.filter(
          (collection) =>
            !commonDefaults.collections ||
            !commonDefaults.collections[collection.name]
        )
      );
    }
    if (!collections.length) {
      console.log('No collections to checkout');
      return;
    }
    for await (const collection of collections) {
      if (
        existsSync(path.join(options.workdir, 'collections', collection.name))
      ) {
        console.log(`Skipping existing collection "${collection.name}"`);
        continue;
      }
      console.log(`Fetching collection "${collection.name}"`);
      const collectionDetails = await pmAPI.getCollection(collection.id);
      if (!collectionDetails) {
        console.log(`Collection "${collection.name}" not found`);
        continue;
      }
      const localCollection = parseCollectionToLocal(collectionDetails);
      await saveLocalCollection(commonDefaults, localCollection);
      addedCollections[collection.name] = collection.id;
    }
    await mergeAndSaveConfig({
      ...options,
      collections: addedCollections,
    });
  });
};
