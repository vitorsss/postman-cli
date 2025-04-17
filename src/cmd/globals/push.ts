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
  GlobalsPushArgs,
} from '@pm-types/cmd';
import { Globals } from '@pm-types/local';
import { loadLocalGlobals } from '@helpers/local';
import {
  parseGlobalToPostman,
} from '@helpers/parser';

export const push: CommandReg<GlobalsPushArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: GlobalsPushArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('push')
    .description('Push local to remote globals');

  registerCommonArgs(cmd, commonDefaults);

  cmd.action(async function action(
    options: CommonArgs & GlobalsPushArgs
  ) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    console.log(`Loading local globals`);
    const localGlobals: Globals | undefined = await loadLocalGlobals(commonDefaults)
    if (!localGlobals) {
      console.log(`Non existing local globals, doing nothing.`);
      return;
    }
    const globalDetails = parseGlobalToPostman(
      localGlobals,
    );

    await pmAPI.updateGlobal(workspace.id, globalDetails);
  });
};
