import DB from "@/config/database";
import {
  CommentInterface,
  DiscussionInterface,
  MappedCommentInterface,
  MappedDiscussionInterface,
  PaginatedCommentInterface,
  PaginatedDiscussionInterface,
} from "@/interfaces/forum.interface";
import {
  CreateCommentDto,
  CreateDiscussionDto,
  UpdateDiscussionDto,
  UpdateCommentDto,
} from "@/dtos/forum.dto";
import { HttpExceptionBadRequest, HttpExceptionForbidden } from "@/exceptions/HttpException";
import sequelize from "sequelize";
import { metaBuilder } from "@/utils/pagination.utils";
import { UserInterface } from "@/interfaces/user.interface";
import { getRoleNameFromUserId } from "@/utils/role.utils";

class ForumService {
  public discussions = DB.DiscussionModel;
  public comments = DB.CommentModel;
  public users = DB.UserModel;
  public roles = DB.RoleModel;
  public userDiscussionLikes = DB.UserDiscussionLikeModel;

  public getDiscussions = async (
    userId: string,
    offset: number,
    limit: number,
    filter?: string,
    commentOption?: string,
  ): Promise<PaginatedDiscussionInterface> => {
    let meta;
    let discussions;
    const whereClause = {};

    if (filter) {
      whereClause["title"] = { [sequelize.Op.iLike]: `%${filter}%` };
    }

    if (!isNaN(offset) && !isNaN(limit)) {
      discussions = await this.discussions.findAndCountAll({
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
                include: [
                  {
                    model: this.roles,
                    as: "roles",
                    attributes: ["name"],
                  },
                ],
              },
            ],
          },
          {
            model: this.users,
            as: "poster",
            attributes: ["id", "username", "profile"],
            include: [
              {
                model: this.roles,
                as: "roles",
                attributes: ["name"],
              },
            ],
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
        where: whereClause,
        order: [["created_at", "DESC"]],
        offset,
        limit,
        distinct: true,
      });

      const { rows, count } = discussions;
      meta = metaBuilder(offset, limit, count);
      return { rows: this.mappedDiscussions(rows, userId, commentOption), meta };
    } else {
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
                include: [
                  {
                    model: this.roles,
                    as: "roles",
                    attributes: ["name"],
                  },
                ],
              },
            ],
          },
          {
            model: this.users,
            as: "poster",
            attributes: ["id", "username", "profile"],
            include: [
              {
                model: this.roles,
                as: "roles",
                attributes: ["name"],
              },
            ],
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
        order: [["created_at", "DESC"]],
        where: whereClause,
      });

      return { rows: this.mappedDiscussions(discussions, userId, commentOption), meta };
    }
  };

  public getDiscussion = async (
    discussionId: string,
    userId: string,
  ): Promise<MappedDiscussionInterface> => {
    const discussion = await this.discussions.findByPk(discussionId, {
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
              include: [
                {
                  model: this.roles,
                  as: "roles",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
        {
          model: this.users,
          as: "poster",
          attributes: ["id", "username", "profile"],
          include: [
            {
              model: this.roles,
              as: "roles",
              attributes: ["name"],
            },
          ],
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

    return this.mappedDiscussions([discussion], userId, "WITHCOMMENT")[0];
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

    const roleName = await getRoleNameFromUserId(posterId);
    if (roleName !== "ADMIN" && existingDiscussion.poster_id !== posterId)
      throw new HttpExceptionForbidden("You are not the poster.");

    await this.discussions.update(discussionData, { where: { id: discussionId } });
  };

  public deleteDiscussion = async (discussionId: string, posterId: string): Promise<void> => {
    const existingDiscussion = await this.discussions.findByPk(discussionId);
    if (!existingDiscussion) throw new HttpExceptionBadRequest("Discussion not found.");

    const roleName = await getRoleNameFromUserId(posterId);
    if (roleName !== "ADMIN" && existingDiscussion.poster_id !== posterId)
      throw new HttpExceptionForbidden("You are not the poster.");

    await this.discussions.destroy({
      where: { id: discussionId },
      individualHooks: true,
    });
  };

  public getComments = async (
    discussionId: string,
    offset: number,
    limit: number,
  ): Promise<PaginatedCommentInterface> => {
    let meta;
    let comments;
    const whereClause = {
      discussion_id: discussionId,
    };

    if (!isNaN(offset) && !isNaN(limit)) {
      comments = await this.comments.findAndCountAll({
        attributes: ["id", "comment_content", "commenter_id", "discussion_id", "created_at"],
        include: [
          {
            model: this.users,
            as: "commenter",
            attributes: ["id", "username", "profile"],
            include: [
              {
                model: this.roles,
                as: "roles",
                attributes: ["name"],
              },
            ],
          },
        ],
        where: whereClause,
        offset,
        limit,
        distinct: true,
      });

      const { rows, count } = comments;
      meta = metaBuilder(offset, limit, count);
      return { rows: this.mappedComments(rows), meta };
    } else {
      comments = await this.comments.findAll({
        attributes: ["id", "comment_content", "commenter_id", "discussion_id", "created_at"],
        include: [
          {
            model: this.users,
            as: "commenter",
            attributes: ["id", "username", "profile"],
            include: [
              {
                model: this.roles,
                as: "roles",
                attributes: ["name"],
              },
            ],
          },
        ],
        where: whereClause,
      });

      return { rows: this.mappedComments(comments), meta };
    }
  };

  public getComment = async (commentId: string): Promise<MappedCommentInterface> => {
    const comment = await this.comments.findByPk(commentId, {
      attributes: ["id", "comment_content", "commenter_id", "discussion_id", "created_at"],
      include: [
        {
          model: this.users,
          as: "commenter",
          attributes: ["id", "username", "profile"],
          include: [
            {
              model: this.roles,
              as: "roles",
              attributes: ["name"],
            },
          ],
        },
        {
          model: this.discussions,
          as: "discussion",
          attributes: ["id", "title", "post_content", "poster_id", "created_at"],
          include: [
            {
              model: this.users,
              as: "poster",
              attributes: ["id", "username", "profile"],
              include: [
                {
                  model: this.roles,
                  as: "roles",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!comment) throw new HttpExceptionBadRequest("Comment not found.");

    return this.mappedComments([comment])[0];
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

    const roleName = await getRoleNameFromUserId(commenterId);
    if (roleName !== "ADMIN" && existingComment.commenter_id !== commenterId)
      throw new HttpExceptionForbidden("You are not the commenter.");

    await this.comments.update(commentData, { where: { id: commentId } });
  };

  public deleteComment = async (commentId: string, commenterId: string): Promise<void> => {
    const existingComment = await this.comments.findByPk(commentId);
    if (!existingComment) throw new HttpExceptionBadRequest("Comment not found.");

    const roleName = await getRoleNameFromUserId(commenterId);
    if (roleName !== "ADMIN" && existingComment.commenter_id !== commenterId)
      throw new HttpExceptionForbidden("You are not the commenter.");

    await this.comments.destroy({ where: { id: commentId } });
  };

  public getLikes = async (discussionId: string): Promise<UserInterface[]> => {
    const existDiscussion = await this.discussions.findByPk(discussionId);
    if (!existDiscussion) throw new HttpExceptionBadRequest("Discussion not found.");

    const userLikes = await this.users.findAll({
      attributes: ["id", "profile", "username"],
      include: [
        {
          model: this.discussions,
          through: {
            attributes: [],
          },
          as: "likers",
          attributes: [],
          where: { id: discussionId },
        },
      ],
    });

    return userLikes;
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
    commentOption?: string,
  ): MappedDiscussionInterface[] => {
    const mappedDiscussions = discussions.map((discussion) => {
      const is_liked = userId ? discussion.likes.some((like) => like.id === userId) : false;
      const comment_count = discussion.comments?.length ?? 0;
      const like_count = discussion.likes?.length ?? 0;
      const poster_id = discussion.poster_id ?? "[Deleted User]";
      const poster_username = discussion.poster?.username ?? "[Deleted User]";
      const poster_profile =
        discussion.poster?.profile ??
        "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg";
      const poster_role = discussion.poster?.roles[0].name ?? "GUEST";
      if (commentOption === "WITHCOMMENT" && discussion.comments) {
        discussion.comments.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const mappedComments: MappedCommentInterface[] = discussion.comments.map((comment) => {
          const commenter_id = comment.commenter?.id ?? "[Deleted User]";
          const commenter_username = comment.commenter?.username ?? "[Deleted User]";
          const commenter_profile =
            comment.commenter?.profile ??
            "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg";
          const commenter_role = comment.commenter?.roles[0].name ?? "GUEST";
          return {
            id: comment.id,
            comment_content: comment.comment_content,
            commenter_id,
            commenter_username,
            commenter_profile,
            commenter_role,
            discussion_id: comment.discussion_id,
            created_at: comment.created_at,
          };
        });

        return {
          id: discussion.id,
          title: discussion.title,
          post_content: discussion.post_content,
          poster_id,
          poster_username,
          poster_profile,
          poster_role,
          comment_count,
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
        poster_id,
        poster_username,
        poster_profile,
        poster_role,
        comment_count,
        like_count,
        is_liked,
        created_at: discussion.created_at,
      };
    });

    return mappedDiscussions;
  };

  public mappedComments = (comments: CommentInterface[]): MappedCommentInterface[] => {
    const mappedComments = comments.map((comment) => {
      const commenter_id = comment.commenter?.id ?? "[Deleted User]";
      const commenter_username = comment.commenter?.username ?? "[Deleted User]";
      const commenter_profile =
        comment.commenter?.profile ??
        "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg";
      const commenter_role = comment.commenter?.roles[0].name ?? "GUEST";
      if (comment.discussion) {
        const discussion_title = comment.discussion.title;
        const discussion_post_content = comment.discussion.post_content;
        const discussion_poster_id = comment.discussion.poster_id ?? "[Deleted User]";
        const discussion_poster_username = comment.discussion.poster?.username ?? "[Deleted User]";
        const discussion_poster_profile =
          comment.discussion.poster?.profile ??
          "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg";
        const discussion_poster_role = comment.discussion.poster?.roles[0].name ?? "GUEST";
        return {
          id: comment.id,
          comment_content: comment.comment_content,
          commenter_id,
          commenter_username,
          commenter_profile,
          commenter_role,
          discussion_id: comment.discussion_id,
          discussion_title,
          discussion_post_content,
          discussion_poster_id,
          discussion_poster_username,
          discussion_poster_profile,
          discussion_poster_role,
          created_at: comment.created_at,
        };
      }

      return {
        id: comment.id,
        comment_content: comment.comment_content,
        commenter_id: comment.commenter_id,
        commenter_username,
        commenter_profile,
        commenter_role,
        discussion_id: comment.discussion_id,
        created_at: comment.created_at,
      };
    });

    return mappedComments;
  };
}

export default ForumService;
