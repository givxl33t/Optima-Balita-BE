import { MetaInterface } from "@/interfaces/pagination.interface";
import { ApiResponseInterface } from "@interfaces/apiResponse.interface";

export function apiResponse<T extends MetaInterface>(
  code: number,
  responseStatus: string,
  message: string,
  data?: unknown,
  meta?: T,
): ApiResponseInterface {
  return {
    code,
    status: responseStatus,
    message,
    meta,
    data,
  };
}
