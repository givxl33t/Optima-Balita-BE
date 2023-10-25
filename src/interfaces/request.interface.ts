import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

/**
 * @desc Generic Authenticated Request Interface
 */
export interface AuthenticateRequest extends Request {
  user?: JwtPayload;
}
