/* eslint-disable no-unused-vars */
import { IsString, MaxLength, IsNotEmpty, IsOptional, IsIn, Equals } from "class-validator";
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
