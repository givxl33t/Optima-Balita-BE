import { rateLimit } from "express-rate-limit";
import { HttpExceptionTooManyRequests } from "@/exceptions/HttpException";

const limiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    return req.ip as string + req.headers["user-agent"] as string;
  },
  handler: () => {
    throw new HttpExceptionTooManyRequests("Too many requests from this IP, please try again after 15 minutes");
  }
});

export default limiterMiddleware;