import { Auth, AuthAttribute } from '@pm-types/local';
import { Auth as PMAuth, Auth1 } from '@pm-types/postman';

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

export function parseAuthToLocal(value: PMAuth): Auth {
  return parseAuthToLocalByType[value.type](value);
}
