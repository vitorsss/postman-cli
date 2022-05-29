import { Command } from 'commander';

export interface PromptValue<T> {
  value: T;
}

export interface CommonArgs {
  config: string;
  token: string;
  baseurl: string;
  workdir: string;
  workspace?: string;
}

export type Configs = CommonArgs & {
  collections?: Record<string, string>;
};

export type OtherConfigs = {
  [key: string]: any;
} & { [key in keyof CommonArgs]?: never };

export type CommandReg<T> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: T
) => void;

export interface BootstrapArgs {}

export interface CollectionsCheckoutArgs {}

export interface CollectionsListArgs {}

export interface CollectionsArgs {
  list?: CollectionsListArgs;
  checkout?: CollectionsCheckoutArgs;
}
