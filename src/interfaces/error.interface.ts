export interface ErrorParentInterface {
  code: string;
  detail: string;
}
export interface ErrorInterface {
  code: number;
  status: string;
  message: string;
  name?: string;
  parent?: ErrorParentInterface;
}
