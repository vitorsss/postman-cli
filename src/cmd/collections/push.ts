import { Command, Option } from 'commander';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
  selectWorkspaceCollections,
} from '@cmd/commons';
import {
  CollectionsPushArgs,
  CommandReg,
  CommonArgs,
  Configs,
} from '@pm-types/cmd';
import { Collection } from '@pm-types/postman';
import { loadLocalCollection } from '@helpers/local';
import { parseCollectionToPostman } from '@helpers/parser';

export const push: CommandReg<CollectionsPushArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: CollectionsPushArgs
): void => {
  defaults = defaults || {
    all: false,
  };
  const cmd = program
    .command('push [name]')
    .description('Push local to remote collections');

  registerCommonArgs(cmd, commonDefaults);

  cmd.addOption(
    new Option('-a, --all', 'Push all attached collections').default(
      defaults.all,
      'false'
    )
  );

  cmd.action(async function action(
    name: string,
    options: CommonArgs & CollectionsPushArgs
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
      workspace.collections = [];
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
      } else {
        console.log(`Missing local collection "${name}"`);
        return;
      }
    } else if (!options.all) {
      collections = await selectWorkspaceCollections(collections);
    }
    if (!collections.length) {
      console.log('No collections to push');
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
      console.log(`Loading local collection "${collection.name}"`);
      const localCollection = await loadLocalCollection(
        commonDefaults,
        collection.name
      );
      if (!localCollection) {
        console.log(`Skipping missing local collection "${collection.name}"`);
        continue;
      }
      console.log(`Pushing collection "${collection.name}"`);
      const collectionDetails = parseCollectionToPostman(localCollection);

      await pmAPI.updateCollection(collection.id, collectionDetails);
    }
  });
};
