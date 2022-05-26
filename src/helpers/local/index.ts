import { Auth } from '@gen/types/auth';
import { Request } from '@gen/types/request';
import { Response } from '@gen/types/response';
import { Variables } from '@gen/types/variables';

export interface LocalCollection extends Folder {
  variables?: Variables;
}

export type Item = Folder | Response | string;

export interface Folder {
  itens: {
    [key: string]: Item;
  };
  request?: Request;
  auth?: Auth;
}

export async function saveLocalCollection(
  collection: LocalCollection
): Promise<void> {}
