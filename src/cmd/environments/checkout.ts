import { Command } from 'commander';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
  mergeAndSaveConfig,
  selectWorkspaceEnvironments,
  workspaceRequiresUID,
} from '@cmd/commons';
import {
  CommandReg,
  CommonArgs,
  Configs,
  EnvironmentsCheckoutArgs,
} from '@pm-types/cmd';
import { Environment } from '@pm-types/postman';
import { schemas } from '@pm-types/local';
import { loadLocalEnvironments, saveLocalEnvironments } from '@helpers/local';
import {
  listEnvironmentsNames,
  mergeLocalEnvironments,
  parseEnvironmentToLocal,
} from '@helpers/parser';

export const checkout: CommandReg<EnvironmentsCheckoutArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: EnvironmentsCheckoutArgs
): void => {
  defaults = defaults || {};
  const cmd = program
    .command('checkout [name|id]')
    .description('Checkout an remote environment to local workdir');

  registerCommonArgs(cmd, commonDefaults);

  cmd.action(async function action(
    idName: string,
    options: CommonArgs & EnvironmentsCheckoutArgs
  ) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    workspace.environments = workspace.environments || [];

    let environments: Environment[] = [];

    if (idName) {
      environments = workspace.environments.filter(
        (environment) =>
          environment.id === idName || environment.name === idName
      );
    } else {
      environments = await selectWorkspaceEnvironments(
        workspace.environments.filter(
          (environment) =>
            !commonDefaults.environments ||
            !commonDefaults.environments[environment.name]
        )
      );
    }
    if (!environments.length) {
      console.log('No environments to checkout');
      return;
    }

    const addedEnvironments: Record<string, string> = {};
    console.log(`Loading local environments`);
    const localEnvironments = (await loadLocalEnvironments(commonDefaults)) || {
      $schema: schemas.environments,
      variables: {},
    };
    const attachedEnvironments: Record<string, boolean> = {};
    for (const environmentName of listEnvironmentsNames(localEnvironments)) {
      attachedEnvironments[environmentName] = true;
    }
    for await (const environment of environments) {
      if (attachedEnvironments[environment.name]) {
        console.log(`Skipping existing environment "${environment.name}"`);
        continue;
      }
      console.log(`Fetching environment "${environment.name}"`);
      const environmentID = workspaceRequiresUID(workspace)
        ? environment.uid
        : environment.id;
      const environmentDetails = await pmAPI.getEnvironment(environmentID);
      if (!environmentDetails) {
        console.log(`Environment "${environment.name}" not found`);
        continue;
      }
      console.log(`Merging environment "${environment.name}"`);
      const localEnvironment = parseEnvironmentToLocal(environmentDetails);
      mergeLocalEnvironments(localEnvironments, localEnvironment);
      addedEnvironments[environment.name] = environmentID;
    }
    await saveLocalEnvironments(commonDefaults, localEnvironments);
    await mergeAndSaveConfig({
      ...options,
      environments: addedEnvironments,
    });
  });
};
