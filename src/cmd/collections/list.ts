import { Command } from 'commander';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
} from '@cmd/commons';
import { CollectionsListArgs, CommandReg, CommonArgs, Configs } from '@pm-types/cmd';

export const list: CommandReg<CollectionsListArgs> = (
  program: Command,
  commonDefaults: Configs,
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

    if (!workspace.collections) {
      console.log('No collections in current workspace');
      return;
    }

    workspace.collections.forEach((collection) => {
      console.log(`${collection.name} (${collection.id})`);
    });
  });
};
