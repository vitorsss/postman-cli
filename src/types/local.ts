import { Auth } from '@gen/types/auth';
import { Request } from '@gen/types/request';
import { Response } from '@gen/types/response';
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
  variables: 'https://vitorsss.github.io/postman-cli/schemas/variables/1.0.0/variables.yaml',
  auth: 'https://vitorsss.github.io/postman-cli/schemas/auth/1.0.0/auth.yaml',
  request: 'https://vitorsss.github.io/postman-cli/schemas/request/1.0.0/request.yaml',
  response: 'https://vitorsss.github.io/postman-cli/schemas/response/1.0.0/response.yaml',
};

export interface LocalCollection extends Folder {
  variables?: Variables;
  name: string;
}

export function instanceOfResponse(object: any): object is Response {
  return 'originalRequest' in object;
}

export function instanceOfFolder(object: any): object is Folder {
  return 'itens' in object;
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
