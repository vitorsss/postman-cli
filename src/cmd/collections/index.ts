import { Command } from 'commander';
import { registerCommonArgs } from '@cmd/commons';
import { checkout } from '@cmd/collections/checkout';
import { list } from '@cmd/collections/list';
import { CollectionsArgs, CommandReg, CommonArgs } from '@pm-types/cmd';

export const collections: CommandReg<CollectionsArgs> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: CollectionsArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('collections')
    .description('Collections operations');

  registerCommonArgs(cmd, commonDefaults);

  checkout(cmd, commonDefaults, defaults.checkout);
  list(cmd, commonDefaults, defaults.list);
};
