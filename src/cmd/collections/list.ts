import { Command } from 'commander';
import {
  CommandReg,
  CommonArgs,
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
} from '@cmd/commons';

export interface CollectionsListArgs {}

export const list: CommandReg<CollectionsListArgs> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: CollectionsListArgs
): void => {
  defaults = defaults || {};
  const cmd = program.command('list').description('List remote collections');

  registerCommonArgs(cmd, commonDefaults);

  cmd.action(async function action(options: CommonArgs & CollectionsListArgs) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    workspace.collections.forEach((collection) => {
      console.log(`${collection.name} (${collection.id})`);
    });
  });
};
