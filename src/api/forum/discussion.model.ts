import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";
import { UserModel } from "../auth/user.model";

export class DiscussionModel extends Model {
  public id!: CreationOptional<string>;
  public title!: string;
  public post_content!: string;
  public poster_id!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;

  public readonly poster: UserModel;
  public readonly likes: UserModel[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate(models: any): void {
    DiscussionModel.belongsTo(models.UserModel, {
      foreignKey: "poster_id",
      as: "poster",
    });
    UserModel.hasMany(models.DiscussionModel, {
      foreignKey: "poster_id",
      as: "discussions",
    });
    DiscussionModel.belongsToMany(models.UserModel, {
      through: models.UserDiscussionLikeModel,
      foreignKey: "discussion_id",
      as: "likes",
    });
  }
}

export default function (sequelize: Sequelize): typeof DiscussionModel {
  DiscussionModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      post_content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      poster_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "discussions",
      sequelize,
      timestamps: true,
      freezeTableName: true,
    },
  );

  return DiscussionModel;
}
