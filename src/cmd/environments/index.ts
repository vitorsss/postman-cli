import { Command } from 'commander';
import { registerCommonArgs } from '@cmd/commons';
import { CommandReg, CommonArgs, EnvironmentsArgs } from '@pm-types/cmd';
import { list } from '@cmd/environments/list';

export const environments: CommandReg<EnvironmentsArgs> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: EnvironmentsArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('environments')
    .description('Environments operations');

  registerCommonArgs(cmd, commonDefaults);

  list(cmd, commonDefaults, defaults.list);
};
