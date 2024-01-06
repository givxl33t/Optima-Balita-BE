import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";
import { UserModel } from "../auth/user.model";

export class ConsultantModel extends Model {
  public id!: CreationOptional<string>;
  public consultant_description!: string;
  public consultant_phone!: string;
  public consultant_id!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;

  public readonly consultant: UserModel;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate(models: any): void {
    ConsultantModel.belongsTo(models.UserModel, {
      foreignKey: "consultant_id",
      as: "consultant",
    });
    UserModel.hasMany(models.ConsultantModel, {
      foreignKey: "consultant_id",
      as: "consultants",
    });
  }
}

export default function (sequelize: Sequelize): typeof ConsultantModel {
  ConsultantModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      consultant_description: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      consultant_phone: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      consultant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "consultants",
      sequelize,
      timestamps: true,
      freezeTableName: true,
    },
  );

  return ConsultantModel;
}
