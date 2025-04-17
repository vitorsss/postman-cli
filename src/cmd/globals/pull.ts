import { Command, Option } from 'commander';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
} from '@cmd/commons';
import {
  CommandReg,
  CommonArgs,
  Configs,
  GlobalsPullArgs,
} from '@pm-types/cmd';
import { Global } from '@pm-types/postman';
import { saveLocalGlobals } from '@helpers/local';
import {
  parseGlobalToLocal,
} from '@helpers/parser';

export const pull: CommandReg<GlobalsPullArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: GlobalsPullArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('pull')
    .description('Pull from remote to local globals');

  registerCommonArgs(cmd, commonDefaults);

  cmd.action(async function action(
    options: CommonArgs & GlobalsPullArgs
  ) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    console.log(`Fetching globals`);
    const global: Global = (await pmAPI.getGlobal(workspace.id)) || {
      values: []
    };
    const localGlobal = parseGlobalToLocal(global);
    await saveLocalGlobals(commonDefaults, localGlobal);
  });
};
