import { NextFunction, Request, Response } from "express";
import { apiResponse } from "@/utils/apiResponse.utils";
import { ErrorInterface } from "@/interfaces/error.interface";
import { StatusCodes } from "http-status-codes";

const errorMiddleware = async (
  error: ErrorInterface,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    console.log("error.parent: ", error.parent);
    console.log("error: ", error);

    // Sequelize error handler
    if (error?.parent?.code) {
      switch (error.parent.code) {
        case "22P02": {
          const message = "Invalid type of data.";
          return res.status(400).json(apiResponse(StatusCodes.BAD_REQUEST, "BAD_REQUEST", message));
        }
        case "42703": {
          const message = "Something went wrong.";
          return res
            .status(500)
            .json(apiResponse(StatusCodes.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", message));
        }
        case "23505": {
          const message = error.parent.detail;
          return res.status(409).json(apiResponse(StatusCodes.CONFLICT, "CONFLICT", message));
        }
      }
    }

    // jwt error handler
    if (error.name) {
      switch (error.name) {
        case "JsonWebTokenError": {
          const message = "Invalid or Expired token. Please login again.";
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(apiResponse(StatusCodes.UNAUTHORIZED, "UNAUTHORIZED", message));
        }
        case "TokenExpiredError": {
          const message = "Invalid or Expired Token. Please login again.";
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(apiResponse(StatusCodes.UNAUTHORIZED, "UNAUTHORIZED", message));
        }
      }
    }

    const code = error.code || 500;
    const status = error.status || "INTERNAL_SERVER_ERROR";
    const message = error.message;

    return res.status(code).json(apiResponse(code, status, message));
  } catch (err) {
    next(err);
  }
};

export default errorMiddleware;
