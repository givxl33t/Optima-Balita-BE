import { Router } from "express";
import ForumController from "@/api/forum/forum.controller";
import { RouteInterface } from "@/interfaces/routes.interface";
import { authenticate } from "@/middlewares/authentication.middleware";
import {
  CreateCommentDto,
  UpdateCommentDto,
  CreateDiscussionDto,
  UpdateDiscussionDto,
  GetDiscussionsQueryDto,
  DiscussionIdParamDto,
  CommentIdParamDto,
} from "@/dtos/forum.dto";
import { PaginationDto } from "@/dtos/pagination.dto";
import validationMiddleware from "@/middlewares/validation.middleware";

class ForumRoute implements RouteInterface {
  public path = "/forum";
  public router = Router();
  public forumController = new ForumController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      authenticate,
      validationMiddleware(GetDiscussionsQueryDto, "query"),
      this.forumController.getDiscussions,
    );
    this.router.get(
      `${this.path}/landing`,
      validationMiddleware(GetDiscussionsQueryDto, "query"),
      this.forumController.getDiscussions,
    );
    this.router.get(
      `${this.path}/:discussionId`,
      authenticate,
      validationMiddleware(DiscussionIdParamDto, "params"),
      this.forumController.getDiscussion,
    );
    this.router.post(
      `${this.path}`,
      authenticate,
      validationMiddleware(CreateDiscussionDto, "body"),
      this.forumController.createDiscussion,
    );
    this.router.put(
      `${this.path}/:discussionId`,
      authenticate,
      validationMiddleware(DiscussionIdParamDto, "params"),
      validationMiddleware(UpdateDiscussionDto, "body"),
      this.forumController.updateDiscussion,
    );
    this.router.delete(
      `${this.path}/:discussionId`,
      authenticate,
      validationMiddleware(DiscussionIdParamDto, "params"),
      this.forumController.deleteDiscussion,
    );
    this.router.get(
      `${this.path}/:discussionId/comment`,
      authenticate,
      validationMiddleware(DiscussionIdParamDto, "params"),
      validationMiddleware(PaginationDto, "query"),
      this.forumController.getComments,
    );
    this.router.get(
      `${this.path}/comment/:commentId`,
      authenticate,
      validationMiddleware(CommentIdParamDto, "params"),
      this.forumController.getComment,
    );
    this.router.post(
      `${this.path}/:discussionId/comment`,
      authenticate,
      validationMiddleware(DiscussionIdParamDto, "params"),
      validationMiddleware(CreateCommentDto, "body"),
      this.forumController.createComment,
    );
    this.router.put(
      `${this.path}/comment/:commentId`,
      authenticate,
      validationMiddleware(CommentIdParamDto, "params"),
      validationMiddleware(UpdateCommentDto, "body"),
      this.forumController.updateComment,
    );
    this.router.delete(
      `${this.path}/comment/:commentId`,
      authenticate,
      validationMiddleware(CommentIdParamDto, "params"),
      this.forumController.deleteComment,
    );
    this.router.get(
      `${this.path}/:discussionId/like`,
      authenticate,
      validationMiddleware(DiscussionIdParamDto, "params"),
      this.forumController.getLikes,
    );
    this.router.post(
      `${this.path}/:discussionId/like`,
      authenticate,
      validationMiddleware(DiscussionIdParamDto, "params"),
      this.forumController.likeDiscussion,
    );
  }
}

export default ForumRoute;
