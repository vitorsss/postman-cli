import { Command } from 'commander';
import { registerCommonArgs } from '@cmd/commons';
import { CommandReg, CommonArgs, EnvironmentsArgs } from '@pm-types/cmd';
import { attach } from '@cmd/environments/attach';
import { checkout } from '@cmd/environments/checkout';
import { list } from '@cmd/environments/list';
import { pull } from '@cmd/environments/pull';
import { push } from '@cmd/environments/push';

export const environments: CommandReg<EnvironmentsArgs> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: EnvironmentsArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('environments')
    .alias('env')
    .alias('e')
    .description('Environments operations');

  registerCommonArgs(cmd, commonDefaults);

  attach(cmd, commonDefaults, defaults.attach);
  checkout(cmd, commonDefaults, defaults.checkout);
  list(cmd, commonDefaults, defaults.list);
  pull(cmd, commonDefaults, defaults.pull);
  push(cmd, commonDefaults, defaults.push);
};
