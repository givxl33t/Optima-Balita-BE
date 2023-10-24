/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
require("dotenv").config();

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_DB_TEST,
  POSTGRES_HOST,
  POSTGRES_PORT,
} = process.env;

module.exports = {
  development: {
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: "postgres",
    operatorsAliases: 0,
    dialectOptions: {
      useUTC: false,
    },
    timezone: "Asia/Jakarta",
    define: {
      paranoid: true,
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      defaultScope: {
        attributes: {
          exclude: ["created_at", "updated_at", "deleted_at", "created_by", "updated_by"],
        },
      },
    },
    logging: false,
  },
  test: {
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB_TEST,
    host: POSTGRES_HOST,
    dialect: "postgres",
    operatorsAliases: 0,
    dialectOptions: {
      useUTC: false,
    },
    timezone: "Asia/Jakarta",
    define: {
      paranoid: true,
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      defaultScope: {
        attributes: {
          exclude: ["created_at", "updated_at", "deleted_at", "created_by", "updated_by"],
        },
      },
    },
    logging: false,
  },
  production: {
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    dialect: "postgres",
    operatorsAliases: 0,
    dialectOptions: {
      useUTC: false,
    },
    timezone: "Asia/Jakarta",
    define: {
      paranoid: true,
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      defaultScope: {
        attributes: {
          exclude: ["created_at", "updated_at", "deleted_at", "created_by", "updated_by"],
        },
      },
    },
    logging: false,
  }
};

