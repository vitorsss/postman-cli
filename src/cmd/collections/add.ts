import { Command } from 'commander';
import { existsSync } from 'fs';
import path from 'path';
import { Collection } from '@integrations/postman';
import {
  CommandReg,
  CommonArgs,
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
  selectWorkspaceCollections,
} from '@cmd/commons';

export interface CollectionsAddArgs {}

export const add: CommandReg<CollectionsAddArgs> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: CollectionsAddArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('add [name|id]')
    .description('Add an remote collection to local workdir');

  registerCommonArgs(cmd, commonDefaults);

  cmd.action(async function action(
    idName: string,
    options: CommonArgs & CollectionsAddArgs
  ) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    let collections: Collection[] = [];
    if (idName) {
      collections = workspace.collections.filter(
        (collection) => collection.id === idName || collection.name === idName
      );
    } else {
      collections = await selectWorkspaceCollections(workspace.collections);
    }
    console.log(collections);
    for await (const collection of collections) {
      if (existsSync(path.join(options.workdir, collection.name))) {
        console.log(`Skipping existing collection "${collection.name}"`);
        continue;
      }
      console.log(`Fetching collection "${collection.name}"`);
      const collectionDetails = await pmAPI.getCollection(collection.id);
      console.log(JSON.stringify(collectionDetails, undefined, '  '));
    }
  });
};
