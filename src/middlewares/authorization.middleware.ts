import { Response, NextFunction } from "express";
import { ADMIN_ID } from "@/utils/constant.utils";
import { HttpExceptionForbidden } from "@/exceptions/HttpException";
import { AuthenticateRequest } from "@/interfaces/request.interface";

export const authorize = (requiredRole) => {
  return (req: AuthenticateRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!Array.isArray(requiredRole)) {
      if (user?.role_id === ADMIN_ID) {
        next();
      }

      if (!user || user?.role_id !== requiredRole)
        throw new HttpExceptionForbidden("You do not have permission to access this resource");
    } else if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(req.user?.role_id))
        throw new HttpExceptionForbidden("You do not have permission to access this resource");
    }

    next();
  };
};
