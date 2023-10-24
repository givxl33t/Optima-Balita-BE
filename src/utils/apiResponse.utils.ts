import { PaginationInterface } from "@/interfaces/pagination.interface";
import { ApiResponseInterface } from "@interfaces/apiResponse.interface";

/**
 * Returns a custom response.
 */
export function apiResponse<T extends PaginationInterface>(
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
