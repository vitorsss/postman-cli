import { Command } from 'commander';
import { registerCommonArgs } from '@cmd/commons';
import { attach } from '@cmd/collections/attach';
import { checkout } from '@cmd/collections/checkout';
import { list } from '@cmd/collections/list';
import { pull } from '@cmd/collections/pull';
import { push } from '@cmd/collections/push';
import { CollectionsArgs, CommandReg, CommonArgs } from '@pm-types/cmd';

export const collections: CommandReg<CollectionsArgs> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: CollectionsArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('collections')
    .alias('coll')
    .alias('c')
    .description('Collections operations');

  registerCommonArgs(cmd, commonDefaults);

  attach(cmd, commonDefaults, defaults.attach);
  checkout(cmd, commonDefaults, defaults.checkout);
  list(cmd, commonDefaults, defaults.list);
  pull(cmd, commonDefaults, defaults.pull);
  push(cmd, commonDefaults, defaults.push);
};
