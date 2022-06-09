import { Command, Option } from 'commander';
import {
  createPostmanAPI,
  getWorkspace,
  registerCommonArgs,
  selectWorkspaceEnvironments,
} from '@cmd/commons';
import {
  CommandReg,
  CommonArgs,
  Configs,
  EnvironmentsPushArgs,
} from '@pm-types/cmd';
import { Environment } from '@pm-types/postman';
import { schemas } from '@pm-types/local';
import { loadLocalEnvironments } from '@helpers/local';
import {
  parseEnvironmentToPostman,
} from '@helpers/parser';

export const push: CommandReg<EnvironmentsPushArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: EnvironmentsPushArgs
): void => {
  defaults = defaults || {
    all: false,
  };
  const cmd = program
    .command('push [name]')
    .description('Push local to remote environments');

  registerCommonArgs(cmd, commonDefaults);

  cmd.addOption(
    new Option('-a, --all', 'Push all attached environments').default(
      defaults.all,
      'false'
    )
  );

  cmd.action(async function action(
    name: string,
    options: CommonArgs & EnvironmentsPushArgs
  ) {
    if (!commonDefaults.environments) {
      console.log('No environments attached to remote workspace.');
      return;
    }

    const pmAPI = await createPostmanAPI(options);

    const workspace = await getWorkspace(pmAPI, options);

    if (!workspace) {
      console.log('Could not find a valid workspace.');
      return;
    }

    workspace.environments = workspace.environments || [];

    const mappedEnvironments = commonDefaults.environments;
    let environments: Environment[] = Object.keys(mappedEnvironments).map(
      (name) => {
        return {
          name,
          id: mappedEnvironments[name],
          uid: '',
        };
      }
    );
    if (name) {
      if (mappedEnvironments[name]) {
        environments = [
          {
            id: mappedEnvironments[name],
            name,
            uid: '',
          },
        ];
      } else {
        console.log(`Missing local collection "${name}"`);
        return;
      }
    } else if (!options.all) {
      environments = await selectWorkspaceEnvironments(environments);
    }
    if (!environments.length) {
      console.log('No environments to push');
      return;
    }

    console.log(`Loading local environments`);
    const localEnvironments = (await loadLocalEnvironments(commonDefaults)) || {
      $schema: schemas.environments,
      variables: {},
    };
    const attachedEnvironments: Record<string, boolean> = {};
    for (const environmentName in commonDefaults.environments) {
      attachedEnvironments[commonDefaults.environments[environmentName]] = true;
    }
    for await (const environment of environments) {
      if (
        !workspace.environments.find(
          (value) => value.id === environment.id || value.uid === environment.id
        )
      ) {
        console.log(
          `Skipping missing remote environment "${environment.name}"`
        );
        continue;
      }
      console.log(`Pushing environment "${environment.name}`);
      const environmentDetails = parseEnvironmentToPostman(
        localEnvironments,
        environment.name
      );

      await pmAPI.updateEnvironment(environment.id, environmentDetails);
    }
  });
};
