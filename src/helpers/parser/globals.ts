import { Globals, schemas } from '@pm-types/local';
import { Global } from '@pm-types/postman';

export function parseGlobalToLocal(
  value: Global
): Globals {
  const globals: Globals = {
    $schema: schemas.globals,
    variables: {},
  };

  for (const { key, enabled, type, value: varValue } of value.values) {
    globals.variables[key] = {
      enabled,
      type: type === 'secret' ? 'secret' : 'text',
      value: varValue,
    };
  }

  return globals;
}

export function parseGlobalToPostman(
  value: Globals,
): Global {
  const global: Global = {
    values: [],
  };

  for (const key in value.variables) {
    const { value: varValue, enabled, type } = value.variables[key];
    global.values.push({
      enabled,
      key,
      value: varValue,
      type,
    });
  }

  return global;
}
