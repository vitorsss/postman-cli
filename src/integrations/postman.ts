import { AxiosError, AxiosInstance, AxiosRequestHeaders } from 'axios';
import { parseAxiosError } from '../helpers/errors';

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

export class PostmanAPI {
  private requester: AxiosInstance;
  private baseUrl: string;
  private authHeaders: AxiosRequestHeaders;
  constructor(requester: AxiosInstance, baseUrl: string, token: string) {
    this.requester = requester;
    this.baseUrl = baseUrl;
    this.authHeaders = {
      'X-API-Key': token,
    };
  }

  async listWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await this.requester({
        method: 'GET',
        baseURL: this.baseUrl,
        url: '/workspaces',
        headers: {
          ...this.authHeaders,
        },
      });
      return response.data.workspaces;
    } catch (err) {
      throw parseAxiosError(err as AxiosError);
    }
  }

  async getWorkspace(id: string): Promise<WorkspaceDetails | undefined> {
    try {
      const response = await this.requester({
        method: 'GET',
        baseURL: this.baseUrl,
        url: `/workspaces/${id}`,
        headers: {
          ...this.authHeaders,
        },
      });
      return response.data.workspace;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status == 404) {
          return;
        }
        throw parseAxiosError(err);
      }
    }
  }
}
