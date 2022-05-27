import { UrlEncodedParameter, FormParameter } from '@gen/postman/collection';

export * from '@gen/postman/collection';

export type PMBodyMode = 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql';
export interface PMBody {
  mode?: PMBodyMode;
  raw?: string;
  urlencoded?: UrlEncodedParameter[];
  formdata?: FormParameter[];
  file?: {
    src?: string | null;
    content?: string;
    [k: string]: unknown;
  };
  graphql?: {
    [k: string]: unknown;
  };
  options?: {
    [k: string]: unknown;
  };
  disabled?: boolean;
  [k: string]: unknown;
}

export type WorkspaceType = 'personal' | 'private' | 'team' | 'public';

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  description: string;
}

export interface WorkspaceDetails extends Workspace {
  collections: Collection[];
  environments: Environment[];
}

export interface Collection {
  id: string;
  name: string;
  uid: string;
}

export interface Environment {
  id: string;
  name: string;
  uid: string;
}

export interface EnvironmentDetails extends Environment {
  uid: never;
}
