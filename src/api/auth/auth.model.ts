import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";

export class AuthModel extends Model {
  public id!: CreationOptional<number>;
  public token!: string;
}

export default function (sequelize: Sequelize): typeof AuthModel {
  AuthModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "auths",
      sequelize: sequelize,
      timestamps: false,
      freezeTableName: true,
    },
  );

  return AuthModel;
}
