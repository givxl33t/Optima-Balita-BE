import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";
import { RoleModel } from "./role.model";
import { UserRoleModel } from "./user_role.model";
import { UserDiscussionLikeModel } from "../forum/userDiscussionLike.model";
import { NutritionHistoryModel } from "../nutrition/nutritionHistory.model";
import { ConsultantModel } from "../consultation/consultant.model";

export class UserModel extends Model {
  public id!: CreationOptional<string>;
  public username: string;
  public email: string;
  public password: string;
  public profile: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;

  public readonly roles: RoleModel[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate(models: any): void {
    UserModel.belongsToMany(models.RoleModel, {
      through: models.UserRoleModel,
      foreignKey: "user_id",
      as: "roles",
    });
    UserModel.belongsToMany(models.DiscussionModel, {
      through: models.UserDiscussionLikeModel,
      foreignKey: "user_id",
      as: "likers",
    });
  }
}

export default function (sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      profile: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
    },
    {
      tableName: "users",
      sequelize,
      timestamps: true,
      freezeTableName: true,
      hooks: {
        beforeDestroy: async (user: UserModel): Promise<void> => {
          await UserRoleModel.destroy({ where: { user_id: user.id } });
          await NutritionHistoryModel.destroy({ where: { creator_id: user.id } });
          await ConsultantModel.destroy({ where: { consultant_id: user.id } });
          await UserDiscussionLikeModel.destroy({ where: { user_id: user.id } });
        },
      },
    },
  );

  return UserModel;
}
