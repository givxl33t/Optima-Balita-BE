/* eslint-disable indent */
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
import uploadImageToCloudinary from "@/utils/uploadImage.utils";
import sequelize from "sequelize";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "@/config/cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import { CLOUDINARY_CLOUD_NAME } from "@/utils/constant.utils";
import { UploadApiOptions } from "cloudinary";
import { getRoleNameFromUserId } from "@/utils/role.utils";

class ArticleService {
  public articles = DB.ArticleModel;
  public users = DB.UserModel;

  public getArticle = async (articleId: string): Promise<MappedArticleInterface> => {
    const article = await this.articles.findByPk(articleId, {
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

  public getArticleBySlug = async (slug: string): Promise<MappedArticleInterface> => {
    const article = await this.articles.findOne({
      include: [
        {
          model: this.users,
          as: "author",
          attributes: ["username"],
        },
      ],
      where: {
        slug,
      },
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
    const articles = await this.articles.findAndCountAll({
      include: [
        {
          model: this.users,
          as: "author",
          attributes: ["username", "profile"],
        },
      ],
      order: order === "RANDOM" ? [sequelize.fn("RANDOM")] : [["created_at", "DESC"]],
      where: filter
        ? {
            [sequelize.Op.or]: [
              { title: { [sequelize.Op.iLike]: `%${filter}%` } },
              { description: { [sequelize.Op.iLike]: `%${filter}%` } },
            ],
          }
        : {},
      offset: !isNaN(offset) ? offset : undefined,
      limit: !isNaN(limit) ? limit : undefined,
    });

    const { rows, count } = articles;
    const meta = !isNaN(offset) && !isNaN(limit) ? metaBuilder(offset, limit, count) : undefined;
    return { rows: this.mappedArticles(rows), meta };
  };

  public createArticle = async (
    articleData: CreateArticleDto,
    authorId: string,
    articleImageFile?: Buffer,
  ): Promise<ArticleInterface> => {
    articleData.slug = await generateSlug(this.articles, articleData.title);

    if (articleImageFile) {
      articleData.image = (
        await uploadImageToCloudinary(
          { public_id: `article_${uuidv4()}`, folder: "article" },
          articleImageFile,
        )
      ).secure_url;
    }

    const article = await this.articles.create({ ...articleData, author_id: authorId });
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

    const roleName = await getRoleNameFromUserId(authorId);
    if (roleName !== "ADMIN" && existingArticle.author_id !== authorId) {
      throw new HttpExceptionForbidden("You are not the author of this article");
    }

    if (articleData.title && articleData.title !== existingArticle.title) {
      articleData.slug = await generateSlug(this.articles, articleData.title);
    }

    if (articleImageFile) {
      let options: UploadApiOptions;

      if (existingArticle.image.includes(CLOUDINARY_CLOUD_NAME as string)) {
        const publicId = extractPublicId(existingArticle.image);
        options = { public_id: publicId, invalidate: true };
      } else {
        options = { public_id: `article_${uuidv4()}`, folder: "article" };
      }

      articleData.image = (await uploadImageToCloudinary(options, articleImageFile)).secure_url;
    }

    await this.articles.update(articleData, {
      where: { id: articleId },
    });
  };

  public deleteArticle = async (articleId: string, authorId: string): Promise<void> => {
    const existingArticle = await this.articles.findByPk(articleId);
    if (!existingArticle) {
      throw new HttpExceptionBadRequest("Article not found");
    }

    const roleName = await getRoleNameFromUserId(authorId);
    if (roleName !== "ADMIN" && existingArticle.author_id !== authorId) {
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
      delete article.author_id;
      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        content: article.content,
        image: article.image,
        author: article.author?.username ?? "[Deleted User]",
        author_profile:
          article.author?.profile ??
          "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg",
        created_at: article.created_at,
      };
    });
  };
}

export default ArticleService;
