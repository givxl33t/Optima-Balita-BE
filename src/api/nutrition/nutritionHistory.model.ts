import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";
import { UserModel } from "../auth/user.model";

export class NutritionHistoryModel extends Model {
  public id!: CreationOptional<string>;
  public child_id!: string;
  public child_name!: string;
  public age_text!: string;
  public height!: number;
  public weight!: number;
  public bmi!: number;
  public height_category!: string;
  public weight_category!: string;
  public mass_category!: string;
  public gender!: string;
  public creator_id!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;

  public readonly creator: UserModel;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate(models: any): void {
    NutritionHistoryModel.belongsTo(models.UserModel, {
      foreignKey: "creator_id",
      as: "creator",
    });
    UserModel.hasMany(models.NutritionHistoryModel, {
      foreignKey: "creator_id",
      as: "nutrition_history",
    });
  }
}

export default function (sequelize: Sequelize): typeof NutritionHistoryModel {
  NutritionHistoryModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      child_id: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      child_name: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      age_text: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      height: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      bmi: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      height_category: {
        type: DataTypes.STRING(256),
        defaultValue: "No Data",
        allowNull: false,
      },
      weight_category: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      mass_category: {
        type: DataTypes.STRING(256),
        defaultValue: "No Data",
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      creator_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "nutrition_histories",
      sequelize,
      timestamps: true,
      freezeTableName: true,
    },
  );

  return NutritionHistoryModel;
}
