import { Command, Option } from 'commander';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
  selectWorkspaceCollections,
} from '@cmd/commons';
import {
  CollectionsPullArgs,
  CommandReg,
  CommonArgs,
  Configs,
} from '@pm-types/cmd';
import { Collection } from '@pm-types/postman';
import { saveLocalCollection } from '@helpers/local';
import { parseCollectionToLocal } from '@helpers/parser';

export const pull: CommandReg<CollectionsPullArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: CollectionsPullArgs
): void => {
  defaults = defaults || {
    all: false,
  };
  const cmd = program
    .command('pull [name]')
    .description('Pull from remote to local collections');

  registerCommonArgs(cmd, commonDefaults);

  cmd.addOption(
    new Option('-a, --all', 'Pull all attached collections').default(
      defaults.all,
      'false'
    )
  );

  cmd.action(async function action(
    name: string,
    options: CommonArgs & CollectionsPullArgs
  ) {
    if (!commonDefaults.collections) {
      console.log('No collections attached to remote workspace.');
      return;
    }

    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    if (!workspace.collections) {
      console.log('No collections in current workspace');
      return;
    }

    const mappedCollections = commonDefaults.collections;
    let collections: Collection[] = Object.keys(mappedCollections).map(
      (name) => {
        return {
          name,
          id: mappedCollections[name],
          uid: '',
        };
      }
    );
    if (name) {
      if (mappedCollections[name]) {
        collections = [
          {
            id: mappedCollections[name],
            name,
            uid: '',
          },
        ];
      }
    } else if (!options.all) {
      collections = await selectWorkspaceCollections(collections);
    }
    if (!collections.length) {
      console.log('No collections to pull');
      return;
    }
    for await (const collection of collections) {
      if (
        !workspace.collections.find(
          (value) => value.id === collection.id || value.uid === collection.id
        )
      ) {
        console.log(
          `Skipping missing remote collection "${collection.name}" (${collection.id})`
        );
        continue;
      }
      console.log(`Fetching collection "${collection.name}"`);
      const collectionDetails = await pmAPI.getCollection(collection.id);
      if (!collectionDetails) {
        console.log(`Collection "${collection.name}" not found`);
        continue;
      }
      console.log(`Saving collection "${collection.name}"`);
      const localCollection = parseCollectionToLocal(collectionDetails);
      await saveLocalCollection(commonDefaults, localCollection);
    }
  });
};
