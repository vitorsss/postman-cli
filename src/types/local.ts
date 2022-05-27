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
  variables: '',
  auth: '',
  request: '',
  response: '',
};

export interface LocalCollection extends Folder {
  variables?: Variables;
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
