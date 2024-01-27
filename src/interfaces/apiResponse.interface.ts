import { MetaInterface } from "./pagination.interface";

export interface ApiResponseInterface {
  code: number;
  status: string;
  message: string;
  meta?: MetaInterface;
  data?: unknown;
  errors?: string | object;
}
