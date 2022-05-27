import {
  Auth,
  AuthAttribute,
  Body,
  Cookie,
  Description,
  FormFileParameter,
  FormParameter,
  FormTextParameter,
  Item,
  Itens,
  LocalCollection,
  Parameter,
  Request,
  Response,
  schemas,
  URL as LocalURL,
  URLBase,
  Variables,
} from '@pm-types/local';
import {
  CollectionDetails,
  DefinitionsDescription,
  Variable,
  VariableList,
  Auth as PMAuth,
  Auth1,
  EventList,
  Items,
  Request as PMRequest,
  Url as PMUrl,
  QueryParam,
  PMBody,
  PMBodyMode,
  FormParameter as PMFormParameter,
  HeaderList,
  Response as PMResponse,
  Header1,
  Cookie as PMCookie,
} from '@pm-types/postman';

function parseDescriptionToLocal(value: DefinitionsDescription): Description {
  if (typeof value === 'string') {
    value = {
      content: value,
    };
  }
  const description: Description = {
    content: value?.content || '',
    type: value?.type,
  };
  return description;
}

function parseVariableToLocal(
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

function parseVariablesToLocal(value: VariableList): Variables {
  const variables: Variables = {
    variables: value.map(parseVariableToLocal),
    $schema: schemas.variables,
  };

  return variables;
}

function parseAuthAttributeToLocal(value: Auth1): AuthAttribute {
  const authAttribute: AuthAttribute = {
    ...value,
  };
  return authAttribute;
}

const parseAuthToLocalByType: {
  [key in PMAuth['type']]: (value: PMAuth) => Auth;
} = {
  apikey: (value: PMAuth): Auth => {
    return {
      apikey: value.apikey?.map(parseAuthAttributeToLocal) || [],
    };
  },
  awsv4: (value: PMAuth): Auth => {
    return {
      awsv4: value.awsv4?.map(parseAuthAttributeToLocal) || [],
    };
  },
  basic: (value: PMAuth): Auth => {
    return {
      basic: value.basic?.map(parseAuthAttributeToLocal) || [],
    };
  },
  bearer: (value: PMAuth): Auth => {
    return {
      bearer: value.bearer?.map(parseAuthAttributeToLocal) || [],
    };
  },
  digest: (value: PMAuth): Auth => {
    return {
      digest: value.digest?.map(parseAuthAttributeToLocal) || [],
    };
  },
  edgegrid: (value: PMAuth): Auth => {
    return {
      edgegrid: value.edgegrid?.map(parseAuthAttributeToLocal) || [],
    };
  },
  hawk: (value: PMAuth): Auth => {
    return {
      hawk: value.hawk?.map(parseAuthAttributeToLocal) || [],
    };
  },
  noauth: (value: PMAuth): Auth => {
    return {
      noauth: true,
    };
  },
  ntlm: (value: PMAuth): Auth => {
    return {
      ntlm: value.ntlm?.map(parseAuthAttributeToLocal) || [],
    };
  },
  oauth1: (value: PMAuth): Auth => {
    return {
      oauth1: value.oauth1?.map(parseAuthAttributeToLocal) || [],
    };
  },
  oauth2: (value: PMAuth): Auth => {
    return {
      oauth2: value.oauth2?.map(parseAuthAttributeToLocal) || [],
    };
  },
};

function parseAuthToLocal(value: PMAuth): Auth {
  return parseAuthToLocalByType[value.type](value);
}

function parseEventsToLocal(value: EventList): Itens {
  const itens: Itens = {};

  for (const event of value) {
    const itemName = `${event.listen}.js`;
    let script = event.script?.exec || '';
    if (Array.isArray(script)) {
      script = script.join('\n');
    }
    if (itens[itemName]) {
      itens[itemName] += `\n${script}`;
    } else {
      itens[itemName] = script;
    }
  }

  return itens;
}

function parseRawUrlToLocal(value: string): LocalURL {
  let search: string = '';
  if (value.includes('?')) {
    [value, search] = value.split('?', 2);
  }
  if (search && search.includes('#/')) {
    let hash;
    [search, hash] = search.split('#/', 2);
    value = `${value}#/${hash}`;
  }

  const url: LocalURL = {
    base: value,
  };

  if (search) {
    url.query = search.split('&').map((param: string): Parameter => {
      const [key, value] = param.split('=');
      return {
        key,
        value,
      };
    });
  }
  return url;
}

function parseUrlToLocal(value: PMUrl): URLBase {
  if (typeof value === 'string') {
    let parsedURL = parseRawUrlToLocal(value);
    if (!parsedURL.query) {
      return value;
    }
    value = {
      raw: value,
    };
  }
  const url: LocalURL = parseRawUrlToLocal(value.raw || '');

  if (value.query) {
    url.query = value.query.map(parseVariableToLocal);
  }

  if (value.variable) {
    url.variable = value.variable.map(parseVariableToLocal);
  }

  return url;
}

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
      json: value.raw || '',
    };
  },
  javascript: (value: PMBody): Body => {
    return {
      javascript: value.raw || '',
    };
  },
  html: (value: PMBody): Body => {
    return {
      html: value.raw || '',
    };
  },
  xml: (value: PMBody): Body => {
    return {
      xml: value.raw || '',
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
      text: value.raw || '',
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
    // @ts-ignore
    const { query, variables } = value.graphql;
    return {
      graphql: {
        query,
        variables,
      },
    };
  },
  urlencoded: (value: PMBody): Body => {
    return {
      urlencoded: value.urlencoded?.map(parseVariableToLocal) || [],
    };
  },
};

function parseBodyToLocal(value: PMBody): Body {
  return parseBodyToLocalByMode[value.mode || 'raw'](value);
}

function parseHeaderToLocal(value: HeaderList | Header1 | string): Parameter[] {
  if (typeof value === 'string') {
    throw Error('unmapped conversion from string to local header');
  }
  return value.map(parseVariableToLocal);
}

function parseRequestToLocal(value: PMRequest): Request {
  if (typeof value === 'string') {
    throw Error('unmapped conversion from string to local request');
  }

  const request: Request = {
    $schema: schemas.request,
    url: parseUrlToLocal(value.url || ''),
    method: value.method,
  };

  if (value.description) {
    request.description = parseDescriptionToLocal(value.description);
  }

  if (value.body) {
    request.body = parseBodyToLocal(value.body);
  }

  if (value.header) {
    request.header = parseHeaderToLocal(value.header);
  }

  return request;
}

function parseCookieToLocal(value: PMCookie): Cookie {
  const cookie: Cookie = {
    domain: value.domain,
    path: value.path,
    expires: value.expires,
    extensions: value.extensions,
    hostOnly: value.hostOnly,
    httpOnly: value.httpOnly,
    maxAge: value.maxAge,
    name: value.name,
    secure: value.secure,
    session: value.session,
    value: value.value,
  };
  return cookie;
}

function parseResponseToLocal(value: PMResponse): {
  name: string;
  response: Response;
} {
  // @ts-ignore
  let name: string = value.name || '';
  const response: Response = {
    $schema: schemas.response,
    body: value.body || '',
    code: value.code || 0,
    status: value.status,
    originalRequest: parseRequestToLocal(value.originalRequest || {}),
  };

  if (value.header) {
    response.header = parseHeaderToLocal(value.header);
  }

  if (value.cookie) {
    response.cookie = value.cookie.map(parseCookieToLocal);
  }

  return {
    name,
    response,
  };
}

function parseItemToLocal(value: Items): {
  name: string;
  item: Item;
} {
  let name: string = value.name || '';
  const item: Item = {
    itens: {},
  };
  if (value.auth) {
    // @ts-ignore
    item.auth = parseAuthToLocal(value.auth);
  }
  if (value.request) {
    // @ts-ignore
    const request = parseRequestToLocal(value.request);
    item.request = request;
    if (value.event) {
      const itens = parseEventsToLocal(value.event);
      for (const name in itens) {
        if (name.includes('prerequest')) {
          request.prerequest = request.prerequest || [];
          request.prerequest.push({
            src: `./${name}`,
          });
        } else if (name.includes('test')) {
          request.test = request.test || [];
          request.test.push({
            src: `./${name}`,
          });
        }
        item.itens[name] = itens[name];
      }
    }
    if (value.response) {
      // @ts-ignore
      for (const pmResponse: PMResponse of value.response) {
        const { name, response } = parseResponseToLocal(pmResponse);
        item.itens[`${name}_response.yaml`] = response;
      }
    }
  } else {
    // @ts-ignore
    for (const itemValue: Items of value.item) {
      const { name, item: parsed } = parseItemToLocal(itemValue);
      item.itens[name] = parsed;
    }
  }
  return {
    name,
    item,
  };
}

export function parseCollectionToLocal(
  value: CollectionDetails
): LocalCollection {
  const localCollection: LocalCollection = {
    name: value.info.name,
    itens: {},
  };

  if (value.variable) {
    localCollection.variables = parseVariablesToLocal(value.variable);
  }

  if (value.auth) {
    localCollection.auth = parseAuthToLocal(value.auth);
  }

  if (value.event) {
    localCollection.itens = parseEventsToLocal(value.event);
  }

  for (const itemValue of value.item) {
    const { name, item } = parseItemToLocal(itemValue);
    localCollection.itens[name] = item;
  }

  return localCollection;
}
