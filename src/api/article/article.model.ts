import { Sequelize, DataTypes, Model, CreationOptional } from "sequelize";
import { UserModel } from "../auth/user.model";

export class ArticleModel extends Model {
  public id!: CreationOptional<string>;
  public slug!: string;
  public title!: string;
  public description!: string;
  public content!: string;
  public image!: CreationOptional<string>;
  public author_id!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;

  public readonly author: UserModel;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate(models: any): void {
    ArticleModel.belongsTo(models.UserModel, {
      foreignKey: "author_id",
      as: "author",
    });
    UserModel.hasMany(models.ArticleModel, {
      foreignKey: "author_id",
      as: "articles",
    });
  }
}

export default function (sequelize: Sequelize): typeof ArticleModel {
  ArticleModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      slug: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(256),
        allowNull: true,
        defaultValue: "https://i.postimg.cc/FzLtWZwX/jonathan-borba-w-RTff-XK9t-M-unsplash.jpg",
      },
      author_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "articles",
      sequelize,
      timestamps: true,
      freezeTableName: true,
    },
  );
  return ArticleModel;
}
