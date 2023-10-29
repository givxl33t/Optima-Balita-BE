import DB from "@/config/database";
import {
  ArticleInterface,
  MappedArticleInterface,
  PaginatedArticleInterface,
} from "@interfaces/article.interface";
import { CreateArticleDto } from "@/dtos/article.dto";
import { HttpExceptionBadRequest } from "@/exceptions/HttpException";
import { metaBuilder } from "@/utils/pagination.utils";
import generateSlug from "@/utils/generateSlug.utils";
import sequelize, { OrderItem } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "@/config/cloudinary";

class ArticleService {
  public articles = DB.ArticleModel;
  public users = DB.UserModel;

  public getArticles = async (
    offset: number,
    limit: number,
    order?: string,
  ): Promise<PaginatedArticleInterface> => {
    let meta;
    let articles;
    const orderClause: sequelize.Order = [];

    if (order === "RANDOM") {
      orderClause.push([sequelize.fn("RANDOM")] as unknown as OrderItem);
    } else {
      orderClause.push(["created_at", "DESC"]);
    }

    if (!isNaN(offset) && !isNaN(limit)) {
      articles = await this.articles.findAndCountAll({
        attributes: [
          "id",
          "slug",
          "title",
          "description",
          "content",
          "image",
          "author_id",
          "created_at",
        ],
        include: [
          {
            model: this.users,
            as: "author",
            attributes: ["username"],
          },
        ],
        offset,
        limit,
        order: orderClause,
      });

      const { rows, count } = articles;
      meta = metaBuilder(offset, limit, count);
      return { rows: this.mappedArticles(rows), meta };
    } else {
      articles = await this.articles.findAll({
        attributes: [
          "id",
          "slug",
          "title",
          "description",
          "content",
          "image",
          "author_id",
          "created_at",
        ],
        include: [
          {
            model: this.users,
            as: "author",
            attributes: ["username"],
          },
        ],
        order: orderClause,
      });

      return { rows: this.mappedArticles(articles), meta };
    }
  };

  public createArticle = async (
    articleData: CreateArticleDto,
    authorId: string,
    articleImageFile?: Buffer,
  ): Promise<ArticleInterface> => {
    let article: ArticleInterface;
    const slug = await generateSlug(this.articles, articleData.title);

    if (articleImageFile) {
      article = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { public_id: `article_${uuidv4()}`, folder: "article" },
            async (error, result) => {
              if (error) {
                reject(new HttpExceptionBadRequest(error.message));
              } else {
                resolve(
                  this.articles.create({
                    ...articleData,
                    slug,
                    author_id: authorId,
                    image: result?.secure_url,
                  }),
                );
              }
            },
          )
          .end(articleImageFile);
      });
    } else {
      article = await this.articles.create({ ...articleData, slug, author_id: authorId });
    }

    return article;
  };

  public mappedArticles = (articles: ArticleInterface[]): MappedArticleInterface[] => {
    return articles.map((article) => {
      const { author } = article;
      const { username } = author;
      delete article.author_id;
      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        content: article.content,
        image: article.image,
        author: username,
        created_at: article.created_at,
      };
    });
  };
}

export default ArticleService;
