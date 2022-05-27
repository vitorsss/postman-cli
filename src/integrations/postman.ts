import { AxiosError, AxiosInstance, AxiosRequestHeaders } from 'axios';
import { parseAxiosError } from '@helpers';
import { CollectionDetails, EnvironmentDetails, Workspace, WorkspaceDetails } from '@pm-types/postman';

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

  async getCollection(id: string): Promise<CollectionDetails | undefined> {
    try {
      const response = await this.requester({
        method: 'GET',
        baseURL: this.baseUrl,
        url: `/collections/${id}`,
        headers: {
          ...this.authHeaders,
        },
      });
      return response.data.collection;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status == 404) {
          return;
        }
        throw parseAxiosError(err);
      }
    }
  }

  async getEnvironment(id: string): Promise<EnvironmentDetails | undefined> {
    try {
      const response = await this.requester({
        method: 'GET',
        baseURL: this.baseUrl,
        url: `/environments/${id}`,
        headers: {
          ...this.authHeaders,
        },
      });
      return response.data.environment;
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