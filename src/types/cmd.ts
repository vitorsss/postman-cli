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
  environments?: Record<string, string>;
  cmd?: Args;
};

export type OtherConfigs = {
  [key: string]: any;
} & { [key in keyof CommonArgs]?: never };

export type CommandReg<T> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: T
) => void;

export interface Args {
  bootstrap?: BootstrapArgs;
  collections?: CollectionsArgs;
  environments?: EnvironmentsArgs;
  globals?: GlobalsArgs;
}

export interface BootstrapArgs { }

export interface CollectionsAttachArgs {
  all: boolean;
}

export interface CollectionsCheckoutArgs { }

export interface CollectionsListArgs { }

export interface CollectionsPullArgs {
  all: boolean;
}

export interface CollectionsPushArgs {
  all: boolean;
}

export interface CollectionsArgs {
  attach?: CollectionsAttachArgs;
  checkout?: CollectionsCheckoutArgs;
  list?: CollectionsListArgs;
  push?: CollectionsPushArgs;
  pull?: CollectionsPullArgs;
}

export interface EnvironmentsAttachArgs {
  all: boolean;
}

export interface EnvironmentsCheckoutArgs { }

export interface EnvironmentsListArgs { }

export interface EnvironmentsPullArgs {
  all: boolean;
}

export interface EnvironmentsPushArgs {
  all: boolean;
}

export interface EnvironmentsArgs {
  attach?: EnvironmentsAttachArgs;
  checkout?: EnvironmentsCheckoutArgs;
  list?: EnvironmentsListArgs;
  pull?: EnvironmentsPullArgs;
  push?: EnvironmentsPushArgs;
}

export interface GlobalsPullArgs { }

export interface GlobalsPushArgs { }

export interface GlobalsArgs {
  pull?: GlobalsPullArgs;
  push?: GlobalsPushArgs;
}
