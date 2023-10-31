import { UserModel } from "@/api/auth/user.model";
import { CommentModel } from "@/api/forum/comment.model";

export interface DiscussionInterface {
  id: string;
  title: string;
  post_content: string;
  poster_id: string;
  poster: UserModel;
  likes: UserModel[];
  comments?: CommentModel[];
  created_at: Date;
}

export interface CommentInterface {
  id: string;
  comment_content: string;
  commenter_id: string;
  discussion_id: string;
  commenter: UserModel;
  created_at: Date;
}

export interface MappedCommentInterface {
  id: string;
  comment_content: string;
  commenter_id: string;
  commenter_username: string;
  commenter_profile: string;
  discussion_id: string;
  created_at: Date;
}

export interface MappedDiscussionInterface {
  id: string;
  title: string;
  post_content: string;
  poster_id: string;
  poster_username: string;
  poster_profile: string;
  is_liked: boolean;
  like_count: number;
  comments?: MappedCommentInterface[];
  created_at: Date;
}
