import { Command, Option } from 'commander';
import { prompt } from 'enquirer';
import configYaml from 'config-yaml';
import { existsSync } from 'fs';
import { requester } from '@helpers';
import { PostmanAPI } from '@integrations/postman';
import deepmerge from 'deepmerge';
import deepclean from 'clean-deep';
import { dump } from 'js-yaml';
import { writeFile } from 'fs/promises';
import { CommonArgs, Configs, OtherConfigs, PromptValue } from '@pm-types/cmd';
import { Collection, Environment, WorkspaceDetails } from '@pm-types/postman';

export function registerCommonArgs(
  program: Command,
  commonDefaults: CommonArgs
): void {
  program
    .addOption(
      new Option('-c, --config <path>', 'config file.').default('./.pm.yaml')
    )
    .addOption(
      new Option(
        '-t, --token <string>',
        'postman api token. (see: https://learning.postman.com/docs/developer/intro-api/#generating-a-postman-api-key)'
      ).default(commonDefaults.token, 'null')
    )
    .addOption(
      new Option(
        '-d, --workdir <path>',
        'workdir for keeping Postman As Code.'
      ).default(commonDefaults.workdir || './pac', './pac')
    )
    .addOption(
      new Option(
        '-w, --workspace <id>',
        'workspace id to sync collections'
      ).default(commonDefaults.workspace, 'null')
    )
    .addOption(
      new Option('--baseurl <url>', 'postman api url').default(
        commonDefaults.baseurl || 'https://api.getpostman.com',
        'https://api.getpostman.com'
      )
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
  if (!collections.length) {
    return [];
  }
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
    selected.value.includes(collection.id)
  );
}

export async function selectCollectionForCollection(
  collection: Collection,
  collections: Collection[]
): Promise<Collection | undefined> {
  const selected = await prompt<PromptValue<string>>({
    type: 'select',
    name: 'value',
    message: `Select collection for "${collection.name}"`,
    choices: [
      {
        message: 'New collection',
        name: 'new',
      },
      ...collections.map((collection) => {
        return {
          message: `${collection.name}(${collection.id})`,
          name: collection.id,
        };
      }),
    ],
  });
  return collections.find((collection) => selected.value === collection.id);
}


export async function selectWorkspaceEnvironments(
  environments: Environment[]
): Promise<Environment[]> {
  if (!environments.length) {
    return [];
  }
  const selected = await prompt<PromptValue<string[]>>({
    type: 'multiselect',
    name: 'value',
    message: 'Select environments',
    choices: environments.map((environment) => {
      return {
        message: `${environment.name}(${environment.id})`,
        name: environment.id,
      };
    }),
  });
  return environments.filter((environment) =>
    selected.value.includes(environment.id)
  );
}

export async function selectEnvironmentForEnvironment(
  environment: Environment,
  environments: Environment[]
): Promise<Environment | undefined> {
  const selected = await prompt<PromptValue<string>>({
    type: 'select',
    name: 'value',
    message: `Select environment for "${environment.name}"`,
    choices: [
      {
        message: 'New environment',
        name: 'new',
      },
      ...environments.map((environment) => {
        return {
          message: `${environment.name}(${environment.id})`,
          name: environment.id,
        };
      }),
    ],
  });
  return environments.find((environment) => selected.value === environment.id);
}

export async function mergeAndSaveConfig(
  options: Configs,
  aditionalConfig: OtherConfigs = {}
) {
  let config = {};
  if (existsSync(options.config)) {
    config = configYaml(options.config);
  }

  config = deepmerge(config, deepclean({
    token: options.token,
    baseurl: options.baseurl,
    workdir: options.workdir,
    workspace: options.workspace,
    collections: options.collections,
    environments: options.environments,
    cmd: options.cmd,
    ...deepclean(aditionalConfig),
  }));

  const dumpedConfig = dump(config);

  await writeFile(options.config, dumpedConfig);
}

export function workspaceRequiresUID(workspace: WorkspaceDetails): boolean {
  return workspace.type === 'public' || workspace.type === 'team';
}
