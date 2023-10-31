import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";

export class UserDiscussionLikeModel extends Model {
  public id!: CreationOptional<string>;
  public user_id!: string;
  public discussion_id!: string;
}

export default function (sequelize: Sequelize): typeof UserDiscussionLikeModel {
  UserDiscussionLikeModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      discussion_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "user_discussion_likes",
      sequelize: sequelize,
      timestamps: false,
      freezeTableName: true,
    },
  );

  return UserDiscussionLikeModel;
}
