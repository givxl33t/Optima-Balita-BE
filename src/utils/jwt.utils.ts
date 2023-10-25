import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { JWT_SECRET_KEY_REFRESH, JWT_SECRET_KEY } from "./constant.utils";

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET_KEY as Secret, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET_KEY_REFRESH as Secret, { expiresIn: "7d" });
};

export const verifyAccessToken = (accessToken: string): JwtPayload => {
  return jwt.verify(accessToken, JWT_SECRET_KEY as Secret) as JwtPayload;
};

export const verifyRefreshToken = (refreshToken: string): JwtPayload => {
  return jwt.verify(refreshToken, JWT_SECRET_KEY_REFRESH as Secret) as JwtPayload;
};
