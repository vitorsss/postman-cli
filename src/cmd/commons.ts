import { Command } from 'commander';
import { prompt } from 'enquirer';
import configYaml from 'config-yaml';
import { existsSync } from 'fs';
import { requester } from '../helpers';
import {
  Collection,
  PostmanAPI,
  WorkspaceDetails,
} from '../integrations/postman';
import deepmerge from 'deepmerge';
import { dump } from 'js-yaml';
import { writeFile } from 'fs/promises';

interface PromptValue<T> {
  value: T;
}

export interface CommonArgs {
  config: string;
  token: string;
  baseurl: string;
  workdir: string;
  workspace?: string;
}

export type OtherConfigs = {
  [key: string]: any;
} & { [key in keyof CommonArgs]?: never };

export type CommandReg<T> = (
  program: Command,
  commonDefaults: CommonArgs,
  defaults?: T
) => void;

export function registerCommonArgs(
  program: Command,
  commonDefaults: CommonArgs
): void {
  program
    .option(
      '-c, --config <path>',
      'config file. (default: ./.pm.yaml)',
      commonDefaults.config || './.pm.yaml'
    )
    .option(
      '-t, --token <string>',
      'postman api token. (see: https://learning.postman.com/docs/developer/intro-api/#generating-a-postman-api-key)',
      commonDefaults.token
    )
    .option(
      '-d, --workdir <path>',
      'workdir for keeping Postman As Code. (default: ./pac)',
      commonDefaults.workdir || './pac'
    )
    .option(
      '-w, --workspace <id>',
      'workspace id to sync collections',
      commonDefaults.workspace
    )
    .option(
      '--baseurl <url>',
      'postman api url',
      commonDefaults.baseurl || 'https://api.getpostman.com'
    );
}

export async function createPostmanAPI(
  options: CommonArgs
): Promise<PostmanAPI> {
  if (!options.token) {
    const token = await prompt<PromptValue<string>>({
      type: 'password',
      name: 'value',
      message: 'Enter your Postman API key',
      required: true,
    });
    options.token = token.value;
  }
  return new PostmanAPI(requester, options.baseurl, options.token);
}

export async function getWorkspace(
  pmAPI: PostmanAPI,
  options: CommonArgs
): Promise<WorkspaceDetails | undefined> {
  if (!options.workspace) {
    const workspaces = await pmAPI.listWorkspaces();
    const workspace = await prompt<PromptValue<string>>({
      type: 'select',
      name: 'value',
      message: 'Select the Workspace your Collections resides within',
      choices: workspaces.map((workspace) => {
        return {
          message: `${workspace.name}(${workspace.id})`,
          name: workspace.id,
        };
      }),
      required: true,
    });
    options.workspace = workspace.value;
  }
  return pmAPI.getWorkspace(options.workspace);
}

export async function selectWorkspaceCollections(
  collections: Collection[]
): Promise<Collection[]> {
  const selected = await prompt<PromptValue<string[]>>({
    type: 'multiselect',
    name: 'value',
    message: 'Select collections',
    choices: collections.map((collection) => {
      return {
        message: `${collection.name}(${collection.id})`,
        name: collection.id,
      };
    }),
  });
  return collections.filter((collection) =>
    selected.value.includes(collection.name)
  );
}

export async function mergeAndSaveConfig(
  options: CommonArgs,
  aditionalConfig: OtherConfigs = {}
) {
  let config = {};
  if (existsSync(options.config)) {
    config = configYaml(options.config);
  }

  config = deepmerge(config, {
    token: options.token,
    baseurl: options.baseurl,
    workdir: options.workdir,
    workspace: options.workspace,
    ...aditionalConfig,
  });

  const dumpedConfig = dump(config);

  await writeFile(options.config, dumpedConfig);
}
