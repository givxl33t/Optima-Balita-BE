import { Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ForumService from "@/services/forum.service";
import { AuthenticateRequest } from "@/interfaces/request.interface";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";

class ForumController {
  public forumService = new ForumService();

  public getDiscussion = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const userId = req.user?.user_id;
      const discussionComments = await this.forumService.getDiscussion(discussionId, userId);
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Discussions successfully found", discussionComments));
    },
  );

  public getDiscussions = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { limit, page, filter, option } = req.query;
      const offset: number = (Number(page) - 1) * Number(limit);
      const userId = req.user?.user_id;
      const { rows, meta } = await this.forumService.getDiscussions(
        userId,
        offset,
        Number(limit),
        filter as string,
        option as string,
      );
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Discussions successfully found", rows, meta));
    },
  );

  public createDiscussion = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const discussionData = req.body;
      const posterId = req.user?.user_id;
      const createdDiscussion = await this.forumService.createDiscussion(discussionData, posterId);
      res
        .status(status.CREATED)
        .json(
          apiResponse(
            status.CREATED,
            "CREATED",
            "Discussion successfully created",
            createdDiscussion,
          ),
        );
    },
  );

  public updateDiscussion = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const discussionData = req.body;
      const posterId = req.user?.user_id;
      await this.forumService.updateDiscussion(discussionId, discussionData, posterId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Discussion successfully updated"));
    },
  );

  public deleteDiscussion = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const posterId = req.user?.user_id;
      await this.forumService.deleteDiscussion(discussionId, posterId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Discussion successfully deleted"));
    },
  );

  public getComments = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const { limit, page } = req.query;
      const offset: number = (Number(page) - 1) * Number(limit);
      const { rows, meta } = await this.forumService.getComments(
        discussionId,
        offset,
        Number(limit),
      );
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Comments successfully found", rows, meta));
    },
  );

  public getComment = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const commentId = req.params.commentId;
      const comment = await this.forumService.getComment(commentId);
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Comment successfully found", comment));
    },
  );

  public createComment = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const commentData = req.body;
      const discussionId = req.params.discussionId;
      const posterId = req.user?.user_id;
      const createdComment = await this.forumService.createComment(
        commentData,
        discussionId,
        posterId,
      );
      res
        .status(status.CREATED)
        .json(
          apiResponse(status.CREATED, "CREATED", "Comment successfully created", createdComment),
        );
    },
  );

  public updateComment = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const commentId = req.params.commentId;
      const commentData = req.body;
      const commenterId = req.user?.user_id;
      await this.forumService.updateComment(commentId, commentData, commenterId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Comment successfully updated"));
    },
  );

  public deleteComment = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const commentId = req.params.commentId;
      const commenterId = req.user?.user_id;
      await this.forumService.deleteComment(commentId, commenterId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Comment successfully deleted"));
    },
  );

  public getLikes = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const likers = await this.forumService.getLikes(discussionId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Likes successfully found", likers));
    },
  );

  public likeDiscussion = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const userId = req.user?.user_id;
      const likeStatus = await this.forumService.likeDiscussion(discussionId, userId);
      res
        .status(status.OK)
        .json(
          apiResponse(
            status.OK,
            "OK",
            `Discussion successfully ${likeStatus ? "liked" : "unliked"}`,
          ),
        );
    },
  );
}

export default ForumController;
