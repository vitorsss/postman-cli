import { Parameter, schemas, Variables } from '@pm-types/local';
import {
  Header,
  QueryParam,
  UrlEncodedParameter,
  Variable,
  VariableList,
} from '@pm-types/postman';
import {
  parseDescriptionToLocal,
  parseDescriptionToPostman,
} from '@helpers/parser/description';

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

export function parseVariableToPostmanUrlEncodedParameter(
  value: Parameter
): UrlEncodedParameter {
  const parameter: UrlEncodedParameter = {
    key: value.key,
    disabled: value.disabled,
    value: value.value,
  };
  if (value.description) {
    parameter.description = parseDescriptionToPostman(value.description);
  }
  return parameter;
}


export function parseVariableToPostman(
  value: Parameter
): Variable {
  const parameter: Variable = {
    key: value.key,
    disabled: value.disabled,
    // @ts-ignore
    value: value.value || '',
  };
  if (value.description) {
    parameter.description = parseDescriptionToPostman(value.description);
  }
  return parameter;
}

export function parseVariableToPostmanHeader(
  value: Parameter
): Header {
  const parameter: Header = {
    key: value.key,
    disabled: value.disabled,
    value: value.value || '',
  };
  if (value.description) {
    parameter.description = parseDescriptionToPostman(value.description);
  }
  return parameter;
}

export function parseVariableToPostmanQueryParam(
  value: Parameter
): QueryParam {
  const parameter: QueryParam = {
    key: value.key,
    disabled: value.disabled,
    value: value.value || '',
  };
  if (value.description) {
    parameter.description = parseDescriptionToPostman(value.description);
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
