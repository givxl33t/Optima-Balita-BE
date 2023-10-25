import { config } from "dotenv";

config();

export const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_DB_TEST,
  POSTGRES_HOST,
  POSTGRES_PORT,

  ADMIN_ID,
  DOCTOR_ID,
  GUEST_ID,
  JWT_SECRET_KEY,
  JWT_SECRET_KEY_REFRESH,

  PORT,
  NODE_ENV,
} = process.env;
