import {
  Body,
  FormFileParameter,
  FormParameter,
  FormTextParameter,
  instanceOfFileBody,
  instanceOfFormDataBody,
  instanceOfGraphQLBody,
  instanceOfRawHTMLBody,
  instanceOfRawJavaScriptBody,
  instanceOfRawJSONBody,
  instanceOfRawTextBody,
  instanceOfRawXMLBody,
  instanceOfURLEncodedBody,
} from '@pm-types/local';
import {
  PMBody,
  PMBodyMode,
  FormParameter as PMFormParameter,
} from '@pm-types/postman';
import {
  parseDescriptionToLocal,
  parseDescriptionToPostman,
} from '@helpers/parser/description';
import { parseMultilineStringToLocal } from '@helpers/parser/multiline';
import {
  parseVariableToLocal,
  parseVariableToPostmanUrlEncodedParameter,
} from '@helpers/parser/variables';

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
  if (value.type === 'text') {
    const formParameter: FormTextParameter = {
      key: value.key,
      contentType: value.contentType,
      disabled: value.disabled,
      value: value.value,
      type: value.type,
    };
    if (value.description) {
      formParameter.description = parseDescriptionToLocal(value.description);
    }
    return formParameter;
  }
  throw Error('unmapped conversion from form data to local');
}

function parseFormDataToPostman(value: FormParameter): PMFormParameter {
  if (value.type === 'file') {
    const formParameter: PMFormParameter = {
      key: value.key,
      contentType: value.contentType,
      disabled: value.disabled,
      src: value.src,
      type: value.type,
    };
    if (value.description) {
      formParameter.description = parseDescriptionToPostman(value.description);
    }
    return formParameter;
  }
  if (value.type === 'text') {
    const formParameter: PMFormParameter = {
      key: value.key,
      contentType: value.contentType,
      disabled: value.disabled,
      value: value.value,
      type: value.type,
    };
    if (value.description) {
      formParameter.description = parseDescriptionToPostman(value.description);
    }
    return formParameter;
  }
  throw Error('unmapped conversion from form data to postman');
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

export function parseBodyToPostman(value: Body): PMBody {
  if (instanceOfRawJSONBody(value)) {
    return {
      mode: 'raw',
      raw: value.json,
      options: {
        raw: {
          language: 'json',
        },
      },
    };
  }

  if (instanceOfRawJavaScriptBody(value)) {
    return {
      mode: 'raw',
      raw: value.javascript,
      options: {
        raw: {
          language: 'javascript',
        },
      },
    };
  }

  if (instanceOfRawHTMLBody(value)) {
    return {
      mode: 'raw',
      raw: value.html,
      options: {
        raw: {
          language: 'html',
        },
      },
    };
  }

  if (instanceOfRawXMLBody(value)) {
    return {
      mode: 'raw',
      raw: value.xml,
      options: {
        raw: {
          language: 'xml',
        },
      },
    };
  }

  if (instanceOfRawTextBody(value)) {
    return {
      mode: 'raw',
      raw: value.text,
      options: {
        raw: {
          language: 'text',
        },
      },
    };
  }

  if (instanceOfFileBody(value)) {
    return {
      mode: 'file',
      file: {
        content: value.file.content,
        src: value.file.src,
      },
    };
  }

  if (instanceOfFormDataBody(value)) {
    return {
      mode: 'formdata',
      formdata: value.formdata.map(parseFormDataToPostman),
    };
  }

  if (instanceOfGraphQLBody(value)) {
    return {
      mode: 'graphql',
      graphql: value.graphql,
    };
  }

  if (instanceOfURLEncodedBody(value)) {
    return {
      mode: 'urlencoded',
      urlencoded: value.urlencoded.map(
        parseVariableToPostmanUrlEncodedParameter
      ),
    };
  }

  throw Error('unmapped conversion from body to postman');
}
