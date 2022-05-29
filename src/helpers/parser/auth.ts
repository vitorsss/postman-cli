import {
  Auth,
  AuthAttribute,
  instanceOfAPIKeyAuth,
  instanceOfAWSv4Auth,
  instanceOfBasicAuth,
  instanceOfBearerAuth,
  instanceOfDigestAuth,
  instanceOfEgdeGridAuth,
  instanceOfHawkAuth,
  instanceOfNoAuth,
  instanceOfNTLMAuth,
  instanceOfOAuth1Auth,
  instanceOfOAuth2Auth,
} from '@pm-types/local';
import { Auth as PMAuth, Auth1 } from '@pm-types/postman';

function parseAuthAttributeToLocal(value: Auth1): AuthAttribute {
  const authAttribute: AuthAttribute = {
    key: value.key,
    type: value.type,
    value: value.value,
  };
  return authAttribute;
}

function parseAuthAttributeToPostman(value: AuthAttribute): Auth1 {
  const authAttribute: Auth1 = {
    key: value.key,
    type: value.type,
    value: value.value,
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

export function parseAuthToLocal(value: PMAuth): Auth {
  return parseAuthToLocalByType[value.type](value);
}

export function parseAuthToPostman(value: Auth): PMAuth {
  if (instanceOfAPIKeyAuth(value)) {
    return {
      type: 'apikey',
      apikey: value.apikey.map(parseAuthAttributeToPostman),
    };
  }
  if (instanceOfAWSv4Auth(value)) {
    return {
      type: 'awsv4',
      awsv4: value.awsv4.map(parseAuthAttributeToPostman),
    };
  }

  if (instanceOfBasicAuth(value)) {
    return {
      type: 'basic',
      basic: value.basic.map(parseAuthAttributeToPostman),
    };
  }

  if (instanceOfBearerAuth(value)) {
    return {
      type: 'bearer',
      bearer: value.bearer.map(parseAuthAttributeToPostman),
    };
  }

  if (instanceOfDigestAuth(value)) {
    return {
      type: 'digest',
      digest: value.digest.map(parseAuthAttributeToPostman),
    };
  }

  if (instanceOfEgdeGridAuth(value)) {
    return {
      type: 'edgegrid',
      edgegrid: value.edgegrid.map(parseAuthAttributeToPostman),
    };
  }

  if (instanceOfHawkAuth(value)) {
    return {
      type: 'hawk',
      hawk: value.hawk.map(parseAuthAttributeToPostman),
    };
  }

  if (instanceOfNoAuth(value)) {
    return {
      type: 'noauth',
      noauth: {},
    };
  }

  if (instanceOfNTLMAuth(value)) {
    return {
      type: 'ntlm',
      ntlm: value.ntlm.map(parseAuthAttributeToPostman),
    };
  }

  if (instanceOfOAuth1Auth(value)) {
    return {
      type: 'oauth1',
      oauth1: value.oauth1.map(parseAuthAttributeToPostman),
    };
  }

  if (instanceOfOAuth2Auth(value)) {
    return {
      type: 'oauth2',
      oauth2: value.oauth2.map(parseAuthAttributeToPostman),
    };
  }

  throw Error('unmapped conversion from auth to postman');
}
