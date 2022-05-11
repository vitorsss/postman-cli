import { AxiosError } from "axios";

export function parseAxiosError(err: AxiosError): Error {
  return Error(
    `${err.code} - ${err?.config?.method} - ${err?.config?.url} - ${
      err.response
        ? `${err?.response?.status} - ${JSON.stringify(err?.response?.data)}`
        : "WITHOUT RESPONSE"
    }`
  );
}
