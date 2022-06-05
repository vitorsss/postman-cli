import { Command } from 'commander';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
} from '@cmd/commons';
import {
  CommandReg,
  CommonArgs,
  Configs,
  EnvironmentsListArgs,
} from '@pm-types/cmd';

export const list: CommandReg<EnvironmentsListArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: EnvironmentsListArgs
): void => {
  defaults = defaults || {};
  const cmd = program.command('list').description('List remote environments');

  registerCommonArgs(cmd, commonDefaults);

  cmd.action(async function action(options: CommonArgs & EnvironmentsListArgs) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    if (!workspace.environments) {
      console.log('No environments in current workspace');
      return;
    }

    workspace.environments.forEach((environment) => {
      console.log(`${environment.name} (${environment.id})`);
    });
  });
};
