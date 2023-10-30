/* eslint-disable no-unused-vars */
import { IsString, MaxLength, IsNotEmpty, IsOptional, IsIn, Equals, IsUUID } from "class-validator";
import { PaginationDto } from "./pagination.dto";

export enum ArticleQuerySortOptions {
  RANDOM = "RANDOM",
}

export class GetArticleQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  @IsIn([...Object.keys(ArticleQuerySortOptions)])
  public sort: string;
}

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty({ message: "Title Required" })
  @MaxLength(255)
  public title: string;

  @IsString()
  @IsNotEmpty({ message: "Description Required" })
  public description: string;

  @IsString()
  @IsNotEmpty({ message: "Content Required" })
  public content: string;

  @IsOptional()
  @Equals(undefined, { message: "Image Required" })
  public image?: string;
}

export class ArticleIdParamDto {
  @IsUUID("4", { message: "Invalid Article ID" })
  @IsNotEmpty({ message: "Article ID Required" })
  public articleId: string;
}

export class UpdateArticleDto extends CreateArticleDto {
  @IsOptional()
  public title: string;

  @IsOptional()
  public description: string;

  @IsOptional()
  public content: string;
}
