import { Parameter, schemas, Variables } from '@pm-types/local';
import { QueryParam, Variable, VariableList } from '@pm-types/postman';
import { parseDescriptionToLocal } from '@helpers/parser/description';

export function parseVariableToLocal(
  value: Variable | QueryParam | string
): Parameter {
  if (typeof value === 'string') {
    throw Error(
      'unmapped conversion from variable string to local parameter value'
    );
  }
  if (value.value && typeof value.value !== 'string') {
    throw Error(
      'unmapped conversion from variable string value to local parameter value'
    );
  }
  if (value.value === null) {
    value.value = undefined;
  }

  const parameter: Parameter = {
    key: value.key || '',
    value: value.value,
    disabled: value.disabled,
  };

  if (value.description) {
    parameter.description = parseDescriptionToLocal(value.description);
  }

  return parameter;
}

export function parseVariablesToLocal(value: VariableList): Variables {
  const variables: Variables = {
    variables: value.map(parseVariableToLocal),
    $schema: schemas.variables,
  };

  return variables;
}
