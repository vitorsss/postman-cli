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
  EnvironmentsPullArgs,
} from '@pm-types/cmd';
import { Environment } from '@pm-types/postman';
import { schemas } from '@pm-types/local';
import { loadLocalEnvironments, saveLocalEnvironments } from '@helpers/local';
import {
  listEnvironmentsNames,
  mergeLocalEnvironments,
  parseEnvironmentToLocal,
} from '@helpers/parser';

export const pull: CommandReg<EnvironmentsPullArgs> = (
  program: Command,
  commonDefaults: Configs,
  defaults?: EnvironmentsPullArgs
): void => {
  defaults = defaults || {
    all: false,
  };
  const cmd = program
    .command('pull [name]')
    .description('Pull from remote to local environments');

  registerCommonArgs(cmd, commonDefaults);

  cmd.addOption(
    new Option('-a, --all', 'Pull all attached environments').default(
      defaults.all,
      'false'
    )
  );

  cmd.action(async function action(
    name: string,
    options: CommonArgs & EnvironmentsPullArgs
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

    if (!workspace.environments) {
      console.log('No environments in current workspace');
      return;
    }

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
      console.log('No environments to pull');
      return;
    }

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
      console.log(`Fetching environment "${environment.name}"`);
      const environmentDetails = await pmAPI.getEnvironment(environment.id);
      if (!environmentDetails) {
        console.log(`Environment "${environment.name}" not found`);
        continue;
      }
      console.log(`Merging environment "${environment.name}"`);
      const localEnvironment = parseEnvironmentToLocal(environmentDetails);
      mergeLocalEnvironments(localEnvironments, localEnvironment);
    }
    await saveLocalEnvironments(commonDefaults, localEnvironments);
  });
};
