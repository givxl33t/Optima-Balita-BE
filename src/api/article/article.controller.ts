import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ArticleService from "@/services/article.service";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";
import { CreateArticleDto, UpdateArticleDto } from "@/dtos/article.dto";
import { ArticleInterface } from "@/interfaces/article.interface";
import { AuthenticateRequest } from "@/interfaces/request.interface";

class ArticleController {
  public articleService = new ArticleService();

  public getArticle = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { articleId } = req.params;
    const article = await this.articleService.getArticle(articleId);
    res.status(status.OK).json(apiResponse(status.OK, "OK", "Article successfully found", article));
  });

  public getArticleBySlug = expressAsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { slug } = req.params;
      const article = await this.articleService.getArticleBySlug(slug);
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Article successfully found", article));
    },
  );

  public getArticles = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { limit, page, filter, sort } = req.query;
    const offset: number = (Number(page) - 1) * Number(limit);
    const { rows, meta } = await this.articleService.getArticles(
      offset,
      Number(limit),
      filter as string,
      sort as string,
    );
    res
      .status(status.OK)
      .json(apiResponse(status.OK, "OK", "Articles successfully found", rows, meta));
  });

  public createArticle = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const articleData: CreateArticleDto = req.body;
      const authorId = req.user?.user_id;
      const articleImageFile = req.file?.buffer;
      const article: ArticleInterface = await this.articleService.createArticle(
        articleData,
        authorId,
        articleImageFile,
      );
      res
        .status(status.CREATED)
        .json(apiResponse(status.CREATED, "CREATED", "Article successfully created", article));
    },
  );

  public updateArticle = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { articleId } = req.params;
      const articleData: UpdateArticleDto = req.body;
      const authorId = req.user?.user_id;
      const articleImageFile = req.file?.buffer;
      await this.articleService.updateArticle(articleId, authorId, articleData, articleImageFile);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Article successfully updated"));
    },
  );

  public deleteArticle = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { articleId } = req.params;
      const authorId = req.user?.user_id;
      await this.articleService.deleteArticle(articleId, authorId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Article successfully deleted"));
    },
  );
}

export default ArticleController;
