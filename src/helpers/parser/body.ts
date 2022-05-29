import {
  Body,
  FormFileParameter,
  FormParameter,
  FormTextParameter,
} from '@pm-types/local';
import {
  PMBody,
  PMBodyMode,
  FormParameter as PMFormParameter,
} from '@pm-types/postman';
import { parseDescriptionToLocal } from '@helpers/parser/description';
import { parseMultilineStringToLocal } from '@helpers/parser/multiline';
import { parseVariableToLocal } from '@helpers/parser/variables';

function parseFormDataToLocal(value: PMFormParameter): FormParameter {
  if (value.type === 'file') {
    const formParameter: FormFileParameter = {
      key: value.key,
      contentType: value.contentType,
      disabled: value.disabled,
      src: value.src,
      type: value.type,
    };
    if (value.description) {
      formParameter.description = parseDescriptionToLocal(value.description);
    }
    return formParameter;
  }
  const formParameter: FormTextParameter = {
    key: value.key,
    contentType: value.contentType,
    disabled: value.disabled,
    // @ts-ignore
    value: value.value,
    type: value.type,
  };
  if (value.description) {
    formParameter.description = parseDescriptionToLocal(value.description);
  }
  return formParameter;
}

const parseRawBodyToLocalByLanguage = {
  json: (value: PMBody): Body => {
    return {
      json: parseMultilineStringToLocal(value.raw || ''),
    };
  },
  javascript: (value: PMBody): Body => {
    return {
      javascript: parseMultilineStringToLocal(value.raw || ''),
    };
  },
  html: (value: PMBody): Body => {
    return {
      html: parseMultilineStringToLocal(value.raw || ''),
    };
  },
  xml: (value: PMBody): Body => {
    return {
      xml: parseMultilineStringToLocal(value.raw || ''),
    };
  },
};

const parseBodyToLocalByMode: {
  [key in PMBodyMode]: (value: PMBody) => Body;
} = {
  raw: (value: PMBody): Body => {
    // @ts-ignore
    const language = value?.options?.raw?.language;
    const parserFn = parseRawBodyToLocalByLanguage[language];
    if (parserFn) {
      return parserFn(value);
    }
    return {
      text: parseMultilineStringToLocal(value.raw || ''),
    };
  },
  file: (value: PMBody): Body => {
    return {
      file: {
        content: value.file?.content,
        src: value.file?.src,
      },
    };
  },
  formdata: (value: PMBody): Body => {
    return {
      formdata: value.formdata?.map(parseFormDataToLocal) || [],
    };
  },
  graphql: (value: PMBody): Body => {
    const { query, variables } = value.graphql as {
      query: string;
      variables: string;
    };
    return {
      graphql: {
        query: parseMultilineStringToLocal(query),
        variables: parseMultilineStringToLocal(variables),
      },
    };
  },
  urlencoded: (value: PMBody): Body => {
    return {
      urlencoded: value.urlencoded?.map(parseVariableToLocal) || [],
    };
  },
};

export function parseBodyToLocal(value: PMBody): Body {
  return parseBodyToLocalByMode[value.mode || 'raw'](value);
}
