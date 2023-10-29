import { NODE_ENV } from "@/utils/constant.utils";
import config from "@/config/dbconfig";
import { Sequelize } from "sequelize";
import UserModel from "@api/auth/user.model";
import RoleModel from "@api/auth/role.model";
import UserRoleModel from "@api/auth/user_role.model";
import AuthModel from "@/api/auth/auth.model";
import ArticleModel from "@/api/article/article.model";

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

const models = {
  UserModel: UserModel(sequelize),
  AuthModel: AuthModel(sequelize),
  RoleModel: RoleModel(sequelize),
  UserRoleModel: UserRoleModel(sequelize),
  ArticleModel: ArticleModel(sequelize),
};

const DB = {
  ...models,
  sequelize,
  Sequelize,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.values(DB).forEach((model: any) => {
  if (model.associate) {
    model.associate(DB);
  }
});

export default DB;
