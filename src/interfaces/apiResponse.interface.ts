import { PaginationInterface } from "./pagination.interface";

export interface ApiResponseInterface {
  code: number;
  status: string;
  message: string;
  meta?: PaginationInterface;
  data?: unknown;
  errors?: string | object;
}
