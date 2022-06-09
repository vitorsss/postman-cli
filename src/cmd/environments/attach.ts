import { Command, Option } from 'commander';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
  mergeAndSaveConfig,
  selectEnvironmentForEnvironment,
  selectWorkspaceEnvironments,
  workspaceRequiresUID,
} from '@cmd/commons';
import {
  CommandReg,
  CommonArgs,
  Configs,
  EnvironmentsAttachArgs,
} from '@pm-types/cmd';
import { Environment } from '@pm-types/postman';
import { schemas } from '@pm-types/local';
import { loadLocalEnvironments } from '@helpers/local';
import {
  listEnvironmentsNames,
  parseEnvironmentToPostman,
} from '@helpers/parser';

export const attach: CommandReg<EnvironmentsAttachArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: EnvironmentsAttachArgs
): void => {
  defaults = defaults || {
    all: false,
  };
  const cmd = program
    .command('attach [name]')
    .description('Attach an remote environment to local workdir');

  registerCommonArgs(cmd, commonDefaults);

  cmd.addOption(
    new Option('-a, --all', 'Attach all unattached environments').default(
      defaults.all,
      'false'
    )
  );

  cmd.action(async function action(
    name: string,
    options: CommonArgs & EnvironmentsAttachArgs
  ) {
    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    workspace.environments = workspace.environments || [];

    const environmentsToAttach: Environment[] = [];

    console.log(`Loading local environments`);
    const localEnvironments = (await loadLocalEnvironments(commonDefaults)) || {
      $schema: schemas.environments,
      variables: {},
    };
    for (const environmentName of listEnvironmentsNames(localEnvironments)) {
      if (
        !commonDefaults.environments ||
        !commonDefaults.environments[environmentName]
      ) {
        environmentsToAttach.push({
          name: environmentName,
          id: environmentName,
          uid: '',
        });
      }
    }
    let environments: Environment[] = environmentsToAttach;
    if (name) {
      environments = environmentsToAttach.filter(
        (environment) => environment.name === name
      );
    } else if (!options.all) {
      environments = await selectWorkspaceEnvironments(environmentsToAttach);
    }
    if (!environments.length) {
      console.log('No environments to attach');
      return;
    }

    const addedEnvironments: Record<string, string> = {};
    const attachedEnvironments: Record<string, boolean> = {};
    for (const environmentName in commonDefaults.environments) {
      attachedEnvironments[commonDefaults.environments[environmentName]] = true;
    }
    let pushWarning = false;
    let updateWorkspace = false;
    for await (const environment of environments) {
      const environmentToAttach = await selectEnvironmentForEnvironment(
        environment,
        workspace.environments.filter((environment) => {
          return (
            !attachedEnvironments[environment.id] &&
            !attachedEnvironments[environment.id]
          );
        })
      );
      if (environmentToAttach) {
        console.log(
          `Attaching "${environment.name}" with existing environment "${environmentToAttach.name}"(${environmentToAttach.id})`
        );
        const environmentID = workspaceRequiresUID(workspace)
          ? environmentToAttach.uid
          : environmentToAttach.id;
        addedEnvironments[environment.name] = environmentID;
        attachedEnvironments[environmentID] = true;
        pushWarning = true;
        continue;
      }

      updateWorkspace = true;
      console.log(`Pushing environment "${environment.name}"`);
      const environmentDetails = parseEnvironmentToPostman(
        localEnvironments,
        environment.name
      );
      const createdEnvironment = await pmAPI.createEnvironment(
        environmentDetails
      );
      console.log(
        `Environment created on remote "${createdEnvironment.name}"(${createdEnvironment.id})`
      );

      const environmentID = workspaceRequiresUID(workspace)
        ? createdEnvironment.uid
        : createdEnvironment.id;
      addedEnvironments[environment.name] = environmentID;
      attachedEnvironments[environmentID] = true;
      workspace.environments.push(createdEnvironment);
    }
    if (updateWorkspace) {
      await pmAPI.updateWorkspace(workspace.id, workspace);
    }
    await mergeAndSaveConfig({
      ...options,
      environments: addedEnvironments,
    });
    if (pushWarning) {
      console.log(
        'Execute environments push for recently attached remote environments'
      );
    }
  });
};
