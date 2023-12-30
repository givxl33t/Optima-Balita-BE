import DB from "@/config/database";
import {
  ArticleInterface,
  MappedArticleInterface,
  PaginatedArticleInterface,
} from "@interfaces/article.interface";
import { CreateArticleDto, UpdateArticleDto } from "@/dtos/article.dto";
import { HttpExceptionBadRequest, HttpExceptionForbidden } from "@/exceptions/HttpException";
import { metaBuilder } from "@/utils/pagination.utils";
import generateSlug from "@/utils/generateSlug.utils";
import sequelize, { OrderItem } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "@/config/cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import { CLOUDINARY_CLOUD_NAME } from "@/utils/constant.utils";
import { UploadApiOptions } from "cloudinary";

class ArticleService {
  public articles = DB.ArticleModel;
  public users = DB.UserModel;

  public getArticle = async (articleId: string): Promise<MappedArticleInterface> => {
    const article = await this.articles.findByPk(articleId, {
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
    });

    if (!article) {
      throw new HttpExceptionBadRequest("Article not found");
    }

    return this.mappedArticles([article])[0];
  };

  public getArticles = async (
    offset: number,
    limit: number,
    filter?: string,
    order?: string,
  ): Promise<PaginatedArticleInterface> => {
    let meta;
    let articles;
    const orderClause: sequelize.Order = [];
    const whereClause = {};

    if (order === "RANDOM") {
      orderClause.push([sequelize.fn("RANDOM")] as unknown as OrderItem);
    } else {
      orderClause.push(["created_at", "DESC"]);
    }

    if (filter) {
      whereClause[sequelize.Op.or] = [
        {
          title: {
            [sequelize.Op.iLike]: `%${filter}%`,
          },
        },
        {
          description: {
            [sequelize.Op.iLike]: `%${filter}%`,
          },
        },
      ];
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
        where: whereClause,
        order: orderClause,
        offset,
        limit,
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
        where: whereClause,
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

  public updateArticle = async (
    articleId: string,
    authorId: string,
    articleData: UpdateArticleDto,
    articleImageFile?: Buffer,
  ): Promise<void> => {
    const existingArticle = await this.articles.findByPk(articleId);
    if (!existingArticle) {
      throw new HttpExceptionBadRequest("Article not found");
    }
    if (existingArticle.author_id !== authorId) {
      throw new HttpExceptionForbidden("You are not the author of this article");
    }

    if (articleData.title) {
      const slug = await generateSlug(this.articles, articleData.title);
      existingArticle.slug = slug;
    }

    if (articleImageFile) {
      let options: UploadApiOptions;

      if (existingArticle.image.includes(CLOUDINARY_CLOUD_NAME as string)) {
        const publicId = extractPublicId(existingArticle.image);
        options = { public_id: publicId, invalidate: true };
      } else {
        options = { public_id: `article_${uuidv4()}`, folder: "article" };
      }

      await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(options, async (error, result) => {
            if (error) {
              reject(new HttpExceptionBadRequest(error.message));
            } else {
              const update = await this.articles.update(
                {
                  ...articleData,
                  slug: existingArticle.slug,
                  image: result?.secure_url,
                },
                {
                  where: {
                    id: articleId,
                  },
                },
              );
              resolve(update);
            }
          })
          .end(articleImageFile);
      });
    }

    await this.articles.update(
      { ...articleData, slug: existingArticle.slug },
      {
        where: {
          id: articleId,
        },
      },
    );
  };

  public deleteArticle = async (articleId: string, authorId: string): Promise<void> => {
    const existingArticle = await this.articles.findByPk(articleId);
    if (!existingArticle) {
      throw new HttpExceptionBadRequest("Article not found");
    }
    if (existingArticle.author_id !== authorId) {
      throw new HttpExceptionForbidden("You are not the author of this article");
    }

    if (existingArticle.image.includes(CLOUDINARY_CLOUD_NAME as string)) {
      const publicId = extractPublicId(existingArticle.image);
      cloudinary.uploader.destroy(publicId, { invalidate: true });
    }

    await this.articles.destroy({ where: { id: articleId } });
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
