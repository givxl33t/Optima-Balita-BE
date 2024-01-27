import { rateLimit } from "express-rate-limit";
import { HttpExceptionTooManyRequests } from "@/exceptions/HttpException";
import { NODE_ENV } from "@/utils/constant.utils";

const limiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "test" ? 9999 : NODE_ENV === "development" ? 9999 : 500, // limit each IP to 500 requests per windowMs
  keyGenerator: (req) => {
    return ((req.ip as string) + req.headers["user-agent"]) as string;
  },
  handler: () => {
    throw new HttpExceptionTooManyRequests(
      "Too many requests from this IP, please try again after 15 minutes",
    );
  },
});

export default limiterMiddleware;
