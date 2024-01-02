/* eslint-disable no-unused-vars */
import {
  IsString,
  IsNumberString,
  IsDecimal,
  IsNotEmpty,
  IsIn,
  MaxLength,
  IsOptional,
} from "class-validator";
import { PaginationDto } from "./pagination.dto";

export enum WeightCategory {
  NORMAL = "Normal",
  UNDERWEIGHT = "Underweight",
  OVERWEIGHT = "Overweight",
  OBESITY = "Obesity",
}

export enum Gender {
  LAKI_LAKI = "Laki-laki",
  PEREMPUAN = "Perempuan",
}

export class GetChildrenQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  public filter: string;
}

export class CreateNutritionHistoryDto {
  @IsString()
  @IsNotEmpty({ message: "Child Name Required" })
  @MaxLength(255)
  public child_name: string;

  @IsString()
  @IsNotEmpty({ message: "Age Text Required" })
  @MaxLength(255)
  public age_text: string;

  @IsNumberString()
  @IsNotEmpty({ message: "Height Required" })
  public height: string;

  @IsNumberString()
  @IsNotEmpty({ message: "Weight Required" })
  public weight: string;

  @IsDecimal()
  @IsNotEmpty({ message: "BMI Required" })
  public bmi: string;

  @IsString()
  @IsNotEmpty({ message: "Weight Category Required" })
  @IsIn([...Object.values(WeightCategory)])
  public weight_category: string;

  @IsString()
  @IsNotEmpty({ message: "Gender Required" })
  @IsIn([...Object.values(Gender)])
  public gender: string;
}
