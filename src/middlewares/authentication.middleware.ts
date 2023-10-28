import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { JwtPayload } from "jsonwebtoken";
import { HttpExceptionUnauthorize } from "@/exceptions/HttpException";
import { AuthenticateRequest } from "@/interfaces/request.interface";

export const authenticate = expressAsyncHandler(
  async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
    const bearer = req.header("Authorization");
    if (!bearer) throw new HttpExceptionUnauthorize("Authorization Header missing.");

    const token = bearer.split(" ")[1];
    if (!token) throw new HttpExceptionUnauthorize("Invalid or Expired token. Please login again.");

    const decodedToken: JwtPayload = verifyAccessToken(token);
    if (!decodedToken)
      throw new HttpExceptionUnauthorize("Invalid or Expired token. Please login again.");

    req.user = {
      user_id: decodedToken.user_id,
      role_id: decodedToken.role_id,
    };

    next();
  },
);
