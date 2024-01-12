import { Router } from "express";
import { uploadImage } from "@/middlewares/multer.middleware";
import ArticleController from "./article.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import {
  GetArticleQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleIdParamDto,
  ArticleSlugParamDto,
} from "@/dtos/article.dto";
import { RouteInterface } from "@/interfaces/routes.interface";
import { authenticate } from "@/middlewares/authentication.middleware";

class ArticleRoute implements RouteInterface {
  public path = "/article";
  public router = Router();
  public articleController = new ArticleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/:articleId`,
      validationMiddleware(ArticleIdParamDto, "params"),
      this.articleController.getArticle,
    );
    this.router.get(
      `${this.path}/slug/:slug`,
      validationMiddleware(ArticleSlugParamDto, "params"),
      this.articleController.getArticleBySlug,
    );
    this.router.get(
      `${this.path}`,
      validationMiddleware(GetArticleQueryDto, "query"),
      this.articleController.getArticles,
    );
    this.router.post(
      `${this.path}`,
      authenticate,
      uploadImage.single("image"),
      validationMiddleware(CreateArticleDto, "body"),
      this.articleController.createArticle,
    );
    this.router.put(
      `${this.path}/:articleId`,
      authenticate,
      uploadImage.single("image"),
      validationMiddleware(ArticleIdParamDto, "params"),
      validationMiddleware(UpdateArticleDto, "body"),
      this.articleController.updateArticle,
    );
    this.router.delete(
      `${this.path}/:articleId`,
      authenticate,
      validationMiddleware(ArticleIdParamDto, "params"),
      this.articleController.deleteArticle,
    );
  }
}

export default ArticleRoute;
