import { Command } from 'commander';
import { mkdir } from 'fs/promises';
import {
  CommandReg,
  CommonArgs,
  createPostmanAPI,
  getWorkspace,
  mergeAndSaveConfig,
  registerCommonArgs,
} from './commons';

export interface BootstrapArgs {}

export const bootstrap: CommandReg<BootstrapArgs> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: BootstrapArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('bootstrap')
    .description('Init current folder to add required configuration files');

  registerCommonArgs(cmd, commonDefaults);

  cmd.action(async function action(options: CommonArgs & BootstrapArgs) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    await mergeAndSaveConfig(options);

    await mkdir(options.workdir, {
      recursive: true,
    });
  });
};
