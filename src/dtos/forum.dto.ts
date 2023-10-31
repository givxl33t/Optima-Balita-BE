/* eslint-disable no-unused-vars */
import { IsString, IsNotEmpty, IsUUID, IsIn, IsOptional, MaxLength } from "class-validator";

export enum DiscussionQueryOption {
  WITHCOMMENT = "WITHCOMMENT",
}

export class GetDiscussionsQueryDto {
  @IsString()
  @IsOptional()
  @IsIn([...Object.keys(DiscussionQueryOption)])
  public option: string;
}

export class CreateDiscussionDto {
  @IsString()
  @IsNotEmpty({ message: "Title Required" })
  @MaxLength(255)
  public title: string;

  @IsString()
  @IsNotEmpty({ message: "Content Required" })
  public post_content: string;
}

export class DiscussionIdParamDto {
  @IsUUID("4", { message: "Invalid Discussion ID" })
  @IsNotEmpty({ message: "Discussion ID Required" })
  public discussionId: string;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: "Content Required" })
  public comment_content: string;
}
