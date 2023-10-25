import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";

export class UserRoleModel extends Model {
  public id!: CreationOptional<string>;
  public user_id!: string;
  public role_id!: string;
}

export default function (sequelize: Sequelize): typeof UserRoleModel {
  UserRoleModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      role_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
    },
    {
      tableName: "user_roles",
      sequelize: sequelize,
      timestamps: false,
      freezeTableName: true,
    },
  );

  return UserRoleModel;
}
