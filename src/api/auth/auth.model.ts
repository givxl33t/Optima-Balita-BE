import { Sequelize, DataTypes, Model } from "sequelize";

export class AuthModel extends Model {
  public token!: string;
}

export default function (sequelize: Sequelize): typeof AuthModel {
  AuthModel.init(
    {
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
