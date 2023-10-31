import DB from "@/config/database";
import {
  CommentInterface,
  DiscussionInterface,
  MappedCommentInterface,
  MappedDiscussionInterface,
} from "@/interfaces/forum.interface";
import {
  CreateCommentDto,
  CreateDiscussionDto,
  UpdateDiscussionDto,
  UpdateCommentDto,
} from "@/dtos/forum.dto";
import { HttpExceptionBadRequest, HttpExceptionForbidden } from "@/exceptions/HttpException";

class ForumService {
  public discussions = DB.DiscussionModel;
  public comments = DB.CommentModel;
  public users = DB.UserModel;
  public userDiscussionLikes = DB.UserDiscussionLikeModel;

  public getDiscussions = async (
    userId: string,
    commentOption?: string,
  ): Promise<MappedDiscussionInterface[]> => {
    let discussions;
    if (commentOption === "WITHCOMMENT") {
      discussions = await this.discussions.findAll({
        attributes: ["id", "title", "post_content", "poster_id", "created_at"],
        include: [
          {
            model: this.comments,
            as: "comments",
            attributes: ["id", "comment_content", "commenter_id", "discussion_id", "created_at"],
            include: [
              {
                model: this.users,
                as: "commenter",
                attributes: ["id", "username", "profile"],
              },
            ],
          },
          {
            model: this.users,
            as: "poster",
            attributes: ["id", "username", "profile"],
          },
          {
            model: this.users,
            through: {
              attributes: [],
            },
            as: "likes",
            attributes: ["id", "username"],
          },
        ],
      });
    } else {
      discussions = await this.discussions.findAll({
        attributes: ["id", "title", "post_content", "poster_id", "created_at"],
        include: [
          {
            model: this.users,
            as: "poster",
            attributes: ["id", "username", "profile"],
          },
          {
            model: this.users,
            through: {
              attributes: [],
            },
            as: "likes",
            attributes: ["id", "username"],
          },
        ],
      });
    }

    return this.mappedDiscussions(discussions, userId);
  };

  public getDiscussionComments = async (
    discussionId: string,
    userId: string,
  ): Promise<MappedDiscussionInterface> => {
    const discussion = await this.discussions.findByPk(discussionId, {
      include: [
        {
          model: this.comments,
          as: "comments",
          attributes: ["id", "comment_content", "commenter_id", "discussion_id", "created_at"],
          include: [
            {
              model: this.users,
              as: "commenter",
              attributes: ["id", "username", "profile"],
            },
          ],
        },
        {
          model: this.users,
          as: "poster",
          attributes: ["id", "username", "profile"],
        },
        {
          model: this.users,
          through: {
            attributes: [],
          },
          as: "likes",
          attributes: ["id", "username"],
        },
      ],
    });

    if (!discussion) throw new HttpExceptionBadRequest("Discussion not found.");

    const mappedDiscussion = this.mappedDiscussions([discussion], userId)[0];
    return mappedDiscussion;
  };

  public createDiscussion = async (
    discussionData: CreateDiscussionDto,
    posterId: string,
  ): Promise<DiscussionInterface> => {
    const discussion = await this.discussions.create({ ...discussionData, poster_id: posterId });
    return discussion;
  };

  public updateDiscussion = async (
    discussionId: string,
    discussionData: UpdateDiscussionDto,
    posterId: string,
  ): Promise<void> => {
    const existingDiscussion = await this.discussions.findByPk(discussionId);
    if (!existingDiscussion) throw new HttpExceptionBadRequest("Discussion not found.");

    if (existingDiscussion.poster_id !== posterId)
      throw new HttpExceptionForbidden("You are not the poster.");

    await this.discussions.update(discussionData, { where: { id: discussionId } });
  };

  public deleteDiscussion = async (discussionId: string, posterId: string): Promise<void> => {
    const existingDiscussion = await this.discussions.findByPk(discussionId);
    if (!existingDiscussion) throw new HttpExceptionBadRequest("Discussion not found.");

    if (existingDiscussion.poster_id !== posterId)
      throw new HttpExceptionForbidden("You are not the poster.");

    await this.discussions.destroy({ where: { id: discussionId } });
  };

  public createComment = async (
    commentData: CreateCommentDto,
    discussionId: string,
    posterId: string,
  ): Promise<CommentInterface> => {
    const existDiscussion = await this.discussions.findByPk(discussionId);
    if (!existDiscussion) throw new HttpExceptionBadRequest("Discussion not found.");

    const comment = await this.comments.create({
      ...commentData,
      commenter_id: posterId,
      discussion_id: discussionId,
    });
    return comment;
  };

  public updateComment = async (
    commentId: string,
    commentData: UpdateCommentDto,
    commenterId: string,
  ): Promise<void> => {
    const existingComment = await this.comments.findByPk(commentId);
    if (!existingComment) throw new HttpExceptionBadRequest("Comment not found.");

    if (existingComment.commenter_id !== commenterId)
      throw new HttpExceptionForbidden("You are not the commenter.");

    await this.comments.update(commentData, { where: { id: commentId } });
  };

  public deleteComment = async (commentId: string, commenterId: string): Promise<void> => {
    const existingComment = await this.comments.findByPk(commentId);
    if (!existingComment) throw new HttpExceptionBadRequest("Comment not found.");

    if (existingComment.commenter_id !== commenterId)
      throw new HttpExceptionForbidden("You are not the commenter.");

    await this.comments.destroy({ where: { id: commentId } });
  };

  public likeDiscussion = async (discussionId: string, userId: string): Promise<boolean> => {
    const existDiscussion = await this.discussions.findByPk(discussionId);
    if (!existDiscussion) throw new HttpExceptionBadRequest("Discussion not found.");

    const userDiscussionLike = await this.userDiscussionLikes.findOne({
      where: { discussion_id: discussionId, user_id: userId },
    });
    if (userDiscussionLike) {
      await this.userDiscussionLikes.destroy({
        where: { discussion_id: discussionId, user_id: userId },
      });
      return false;
    }
    await this.userDiscussionLikes.create({ discussion_id: discussionId, user_id: userId });
    return true;
  };

  public mappedDiscussions = (
    discussions: DiscussionInterface[],
    userId: string,
  ): MappedDiscussionInterface[] => {
    const mappedDiscussions = discussions.map((discussion) => {
      const is_liked = discussion.likes.some((like) => like.id === userId);
      const like_count = discussion.likes.length;
      const poster_username = discussion.poster.username;
      const poster_profile = discussion.poster.profile;
      if (discussion.comments) {
        const mappedComments: MappedCommentInterface[] = discussion.comments.map((comment) => {
          const commenter_username = comment.commenter.username;
          const commenter_profile = comment.commenter.profile;
          return {
            id: comment.id,
            comment_content: comment.comment_content,
            commenter_id: comment.commenter_id,
            commenter_username,
            commenter_profile,
            discussion_id: comment.discussion_id,
            created_at: comment.created_at,
          };
        });

        return {
          id: discussion.id,
          title: discussion.title,
          post_content: discussion.post_content,
          poster_id: discussion.poster_id,
          poster_username,
          poster_profile,
          like_count,
          is_liked,
          comments: mappedComments,
          created_at: discussion.created_at,
        };
      }

      return {
        id: discussion.id,
        title: discussion.title,
        post_content: discussion.post_content,
        poster_id: discussion.poster_id,
        poster_username,
        poster_profile,
        like_count,
        is_liked,
        created_at: discussion.created_at,
      };
    });

    return mappedDiscussions;
  };
}

export default ForumService;
