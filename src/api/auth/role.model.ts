import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";

export class RoleModel extends Model {
  public id!: CreationOptional<string>;
  public name!: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate(models: any): void {
    RoleModel.belongsToMany(models.UserModel, {
      through: models.UserRoleModel,
      foreignKey: "role_id",
      as: "users",
    });
  }
}

export default function (sequelize: Sequelize): typeof RoleModel {
  RoleModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
    },
    {
      tableName: "roles",
      sequelize: sequelize,
      timestamps: false,
      freezeTableName: true,
    },
  );

  return RoleModel;
}
