import { Command } from 'commander';
import { CommandReg, CommonArgs, registerCommonArgs } from '@cmd/commons';
import { CollectionsAddArgs, add } from '@cmd/collections/add';
import { CollectionsListArgs, list } from '@cmd/collections/list';

export { CollectionsAddArgs } from '@cmd/collections/add';
export { CollectionsListArgs } from '@cmd/collections/list';

export interface CollectionsArgs {
  list?: CollectionsListArgs;
  add?: CollectionsAddArgs;
}

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

  add(cmd, commonDefaults, defaults.add);
  list(cmd, commonDefaults, defaults.list);
};
