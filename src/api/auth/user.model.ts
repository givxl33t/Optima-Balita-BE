import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";
import { RoleModel } from "./role.model";

export class UserModel extends Model {
  public id!: CreationOptional<string>;
  public username: string;
  public email: string;
  public password: string;
  public profile: string;

  public readonly roles: RoleModel[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate(models: any): void {
    UserModel.belongsToMany(models.RoleModel, {
      through: models.UserRoleModel,
      foreignKey: "user_id",
      as: "roles",
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
    },
  );
  return UserModel;
}
