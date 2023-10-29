import { Router } from "express";
import { uploadImage } from "@/middlewares/multer.middleware";
import ArticleController from "./article.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import { GetArticleQueryDto, CreateArticleDto } from "@/dtos/article.dto";
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
  }
}

export default ArticleRoute;
