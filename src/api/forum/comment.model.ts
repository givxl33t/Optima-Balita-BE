import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";
import { UserModel } from "../auth/user.model";
import { DiscussionModel } from "./discussion.model";

export class CommentModel extends Model {
  public id!: CreationOptional<string>;
  public comment_content!: string;
  public commenter_id!: string;
  public discussion_id!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;

  public readonly commenter: UserModel;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate(models: any): void {
    CommentModel.belongsTo(models.UserModel, {
      foreignKey: "commenter_id",
      as: "commenter",
    });
    UserModel.hasMany(models.CommentModel, {
      foreignKey: "commenter_id",
      as: "comments",
    });
    CommentModel.belongsTo(models.DiscussionModel, {
      foreignKey: "discussion_id",
      as: "discussion",
    });
    DiscussionModel.hasMany(models.CommentModel, {
      foreignKey: "discussion_id",
      as: "comments",
    });
  }
}

export default function (sequelize: Sequelize): typeof CommentModel {
  CommentModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      comment_content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      commenter_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      discussion_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "comments",
      sequelize,
      timestamps: true,
      freezeTableName: true,
    },
  );

  return CommentModel;
}
