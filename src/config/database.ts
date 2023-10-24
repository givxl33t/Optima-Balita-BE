import { NODE_ENV } from "@utils/constant";
import config from "@/config/dbconfig";
import { Sequelize } from "sequelize";

const dbConfig = config[NODE_ENV || "development"];
const sequelize = new Sequelize(
  dbConfig.database as string,
  dbConfig.username as string,
  dbConfig.password,
  dbConfig,
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

const db = {
  sequelize,
  Sequelize,
};

export default db;