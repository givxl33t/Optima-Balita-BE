import { IsNumberString, IsOptional } from "class-validator";

export class PaginationDto {
  @IsNumberString()
  @IsOptional()
  public limit: string;

  @IsNumberString()
  @IsOptional()
  public page: string;
}
