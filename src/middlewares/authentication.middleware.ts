import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { JwtPayload } from "jsonwebtoken";
import { HttpExceptionUnauthorize } from "@/exceptions/HttpException";
import { AuthenticateRequest } from "@/interfaces/request.interface";

import DB from "@/config/database";
const auths = DB.AuthModel;

export const authenticate = expressAsyncHandler(
  async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
    const bearer = req.header("Authorization");
    if (!bearer) throw new HttpExceptionUnauthorize("Authorization Header missing.");

    const token = bearer.split(" ")[1];
    if (!token) throw new HttpExceptionUnauthorize("Unauthorized. Please login to continue.");

    const decodedToken: JwtPayload = verifyAccessToken(token);
    if (!decodedToken)
      throw new HttpExceptionUnauthorize("Unauthorized. Please login to continue.");

    const tokenExists = await auths.findOne({
      where: { token },
    });

    if (!tokenExists) throw new HttpExceptionUnauthorize("Unauthorized. Please login to continue.");

    req.user = {
      user_id: decodedToken.user_id,
      role_id: decodedToken.role_id,
    };

    next();
  },
);
