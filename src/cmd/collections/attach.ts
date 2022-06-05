import { Command, Option } from 'commander';
import path from 'path';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
  selectWorkspaceCollections,
  selectCollectionForCollection,
  mergeAndSaveConfig,
  workspaceRequiresUID,
} from '@cmd/commons';
import { parseCollectionToPostman } from '@helpers/parser';
import { loadLocalCollection } from '@helpers/local';
import {
  CollectionsAttachArgs,
  CommandReg,
  CommonArgs,
  Configs,
} from '@pm-types/cmd';
import { Collection } from '@pm-types/postman';
import { readdir } from 'fs/promises';

export const attach: CommandReg<CollectionsAttachArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: CollectionsAttachArgs
): void => {
  defaults = defaults || {
    all: false,
  };
  const cmd = program
    .command('attach [name]')
    .description('Attach an remote collection to local workdir');

  registerCommonArgs(cmd, commonDefaults);

  cmd.addOption(
    new Option('-a, --all', 'Attach all unattached collections').default(
      defaults.all,
      'false'
    )
  );

  cmd.action(async function action(
    name: string,
    options: CommonArgs & CollectionsAttachArgs
  ) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    if (!workspace.collections) {
      workspace.collections = [];
    }

    const collectionsToAttach: Collection[] = [];
    for (const file of await readdir(
      path.join(commonDefaults.workdir, 'collections'),
      { withFileTypes: true }
    )) {
      if (
        file.isDirectory() &&
        (!commonDefaults.collections || !commonDefaults.collections[file.name])
      ) {
        collectionsToAttach.push({
          name: file.name,
          id: file.name,
          uid: '',
        });
      }
    }

    let collections: Collection[] = collectionsToAttach;
    if (name) {
      collections = collectionsToAttach.filter(
        (collection) => collection.name === name
      );
    } else if (!options.all) {
      collections = await selectWorkspaceCollections(collectionsToAttach);
    }
    if (!collections.length) {
      console.log('No collections to attach');
      return;
    }
    const addedCollections: Record<string, string> = {};
    const attachedCollections: Record<string, boolean> = {};
    for (const collectionName in commonDefaults.collections) {
      attachedCollections[commonDefaults.collections[collectionName]] = true;
    }
    let pushWarning = false;
    let updateWorkspace = false;
    for await (const collection of collections) {
      const collectionToAttach = await selectCollectionForCollection(
        collection,
        workspace.collections.filter((collection) => {
          return (
            !attachedCollections[collection.id] &&
            !attachedCollections[collection.uid]
          );
        })
      );
      if (collectionToAttach) {
        console.log(
          `Attaching "${collection.name}" with existing collection "${collectionToAttach.name}"(${collectionToAttach.id})`
        );
        const collectionID = workspaceRequiresUID(workspace)
          ? collectionToAttach.uid
          : collectionToAttach.id;
        addedCollections[collection.name] = collectionID;
        attachedCollections[collectionID] = true;
        pushWarning = true;
        continue;
      }

      updateWorkspace = true;
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
      const createdCollection = await pmAPI.createCollection(collectionDetails);
      console.log(
        `Collection created on remote "${createdCollection.name}"(${createdCollection.id})`
      );
      const collectionID = workspaceRequiresUID(workspace)
        ? createdCollection.uid
        : createdCollection.id;
      addedCollections[collection.name] = collectionID;
      attachedCollections[collectionID] = true;
      workspace.collections.push(createdCollection);
    }
    if (updateWorkspace) {
      await pmAPI.updateWorkspace(workspace.id, workspace);
    }
    await mergeAndSaveConfig({
      ...options,
      collections: addedCollections,
    });
    if (pushWarning) {
      console.log(
        'Execute collections push for recently attached remote collections'
      );
    }
  });
};
