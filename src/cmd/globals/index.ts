import { Command } from 'commander';
import { registerCommonArgs } from '@cmd/commons';
import { CommandReg, CommonArgs, GlobalsArgs } from '@pm-types/cmd';
import { pull } from '@cmd/globals/pull';
import { push } from '@cmd/globals/push';

export const globals: CommandReg<GlobalsArgs> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: GlobalsArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('globals')
    .alias('global')
    .alias('g')
    .description('Globals operations');

  registerCommonArgs(cmd, commonDefaults);

  pull(cmd, commonDefaults, defaults.pull);
  push(cmd, commonDefaults, defaults.push);
};
