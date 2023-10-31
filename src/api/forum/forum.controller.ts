import { Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ForumService from "@/services/forum.service";
import { AuthenticateRequest } from "@/interfaces/request.interface";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";

class ForumController {
  public forumService = new ForumService();

  public getDiscussionComments = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const userId = req.user?.user_id;
      const discussionComments = await this.forumService.getDiscussionComments(
        discussionId,
        userId,
      );
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Discussions successfully found", discussionComments));
    },
  );

  public getDiscussions = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { option } = req.query;
      const userId = req.user?.user_id;
      const discussions = await this.forumService.getDiscussions(userId, option as string);
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Discussions successfully found", discussions));
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
