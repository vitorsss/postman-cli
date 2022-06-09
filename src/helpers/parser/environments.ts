import { Environments, schemas } from '@pm-types/local';
import { EnvironmentDetails } from '@pm-types/postman';

export function mergeLocalEnvironments(
  target: Environments,
  source: Environments
): void {
  for (const variableName in source.variables) {
    const { enabled, envs, type } = source.variables[variableName];

    target.variables[variableName] = {
      ...(target.variables[variableName] || { envs: {} }),
      enabled,
      type,
    };

    const targetEnvs = target.variables[variableName].envs;

    for (const envName in envs) {
      targetEnvs[envName] = envs[envName];
    }
  }
}

export function listEnvironmentsNames(environments: Environments): string[] {
  const environmentsNames: Record<string, boolean> = {};

  for (const variableName in environments.variables) {
    const {
      envs,
    } = environments.variables[variableName];
    for (const envName in envs) {
      environmentsNames[envName] = true;
    }
  }

  return Object.keys(environmentsNames);
}

export function parseEnvironmentToLocal(
  value: EnvironmentDetails
): Environments {
  const environments: Environments = {
    $schema: schemas.environments,
    variables: {},
  };

  for (const {key, enabled, type, value: varValue} of value.values) {
    environments.variables[key] = {
      enabled,
      envs: {
        [value.name]: varValue,
      },
      type: type === 'secret' ? 'secret' : 'text',
    };
  }

  return environments;
}

export function parseEnvironmentToPostman(
  value: Environments,
  name: string
): EnvironmentDetails {
  const environment: EnvironmentDetails = {
    id: '',
    uid: '',
    name,
    values: [],
  };

  for (const key in value.variables) {
    const { envs, enabled, type } = value.variables[key];
    if (envs[name] || envs[name] === '') {
      environment.values.push({
        enabled,
        key,
        value: envs[name],
        type: type,
      });
    }
  }

  return environment;
}
