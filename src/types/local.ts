import {
  Auth,
  NoAuth,
  APIKeyAuth,
  AWSv4Auth,
  BasicAuth,
  BearerAuth,
  DigestAuth,
  EgdeGridAuth,
  HawkAuth,
  NTLMAuth,
  OAuth1Auth,
  OAuth2Auth,
} from '@gen/types/auth';
import {
  FileBody,
  FormDataBody,
  GraphQLBody,
  RawHTMLBody,
  RawJavaScriptBody,
  RawJSONBody,
  RawTextBody,
  RawXMLBody,
  Request,
  URLEncodedBody,
} from '@gen/types/request';
import { FormFileParameter, FormTextParameter, Response } from '@gen/types/response';
import { Variables } from '@gen/types/variables';

export { Auth, AuthAttribute } from '@gen/types/auth';
export {
  Request,
  URL,
  URLBase,
  Body,
  FormParameter,
  FormFileParameter,
  FormTextParameter,
} from '@gen/types/request';
export { Response, Cookie } from '@gen/types/response';
export { Variables, Parameter, Description } from '@gen/types/variables';

export const schemas = {
  variables:
    'https://vitorsss.github.io/postman-cli/schemas/variables/1.0.0/variables.yaml',
  auth: 'https://vitorsss.github.io/postman-cli/schemas/auth/1.0.0/auth.yaml',
  request:
    'https://vitorsss.github.io/postman-cli/schemas/request/1.0.0/request.yaml',
  response:
    'https://vitorsss.github.io/postman-cli/schemas/response/1.0.0/response.yaml',
};

export interface LocalCollection extends Folder {
  variables?: Variables;
  name: string;
}

export type Item = Folder | Response | string;

export interface Itens {
  [key: string]: Item;
}

export interface Folder {
  itens: Itens;
  request?: Request;
  auth?: Auth;
}

export function instanceOfResponse(object: any): object is Response {
  return 'originalRequest' in object;
}

export function instanceOfFolder(object: any): object is Folder {
  return 'itens' in object;
}

export function instanceOfNoAuth(object: any): object is NoAuth {
  return 'noauth' in object;
}

export function instanceOfAPIKeyAuth(object: any): object is APIKeyAuth {
  return 'apikey' in object;
}

export function instanceOfAWSv4Auth(object: any): object is AWSv4Auth {
  return 'awsv4' in object;
}

export function instanceOfBasicAuth(object: any): object is BasicAuth {
  return 'basic' in object;
}

export function instanceOfBearerAuth(object: any): object is BearerAuth {
  return 'bearer' in object;
}

export function instanceOfDigestAuth(object: any): object is DigestAuth {
  return 'digest' in object;
}

export function instanceOfEgdeGridAuth(object: any): object is EgdeGridAuth {
  return 'edgegrid' in object;
}

export function instanceOfHawkAuth(object: any): object is HawkAuth {
  return 'hawk' in object;
}

export function instanceOfNTLMAuth(object: any): object is NTLMAuth {
  return 'ntlm' in object;
}

export function instanceOfOAuth1Auth(object: any): object is OAuth1Auth {
  return 'oauth1' in object;
}

export function instanceOfOAuth2Auth(object: any): object is OAuth2Auth {
  return 'oauth2' in object;
}

export function instanceOfRawJSONBody(object: any): object is RawJSONBody {
  return 'json' in object;
}

export function instanceOfRawTextBody(object: any): object is RawTextBody {
  return 'text' in object;
}

export function instanceOfRawJavaScriptBody(
  object: any
): object is RawJavaScriptBody {
  return 'javascript' in object;
}

export function instanceOfRawHTMLBody(object: any): object is RawHTMLBody {
  return 'html' in object;
}

export function instanceOfRawXMLBody(object: any): object is RawXMLBody {
  return 'xml' in object;
}

export function instanceOfURLEncodedBody(
  object: any
): object is URLEncodedBody {
  return 'urlencoded' in object;
}

export function instanceOfFormDataBody(object: any): object is FormDataBody {
  return 'formdata' in object;
}

export function instanceOfFileBody(object: any): object is FileBody {
  return 'file' in object;
}

export function instanceOfGraphQLBody(object: any): object is GraphQLBody {
  return 'graphql' in object;
}
