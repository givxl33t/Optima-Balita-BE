import type { ClassConstructor } from "class-transformer";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";

function getConstraintValue(obj: object): unknown {
  for (const prop in obj) {
    if (prop === "constraints") {
      return obj[prop];
    } else if (typeof obj[prop] === "object") {
      const result = getConstraintValue(obj[prop]);
      if (result) {
        return result;
      }
    }
  }
}

const validationMiddleware = (
  type: ClassConstructor<object>,
  value: string | "body" | "query" | "params" = "body",
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, res, next) => {
    validate(plainToClass(type, req[value]), {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) =>
          Object.values(getConstraintValue(error) as unknown as string),
        );
        return res
          .status(status.UNPROCESSABLE_ENTITY)
          .json(apiResponse(status.UNPROCESSABLE_ENTITY, "UNPROCESSABLE ENTITY", message[0][0]));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
