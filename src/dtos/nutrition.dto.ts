/* eslint-disable no-unused-vars */
import {
  IsString,
  IsNumberString,
  IsDecimal,
  IsNotEmpty,
  IsIn,
  MaxLength,
  IsOptional,
  IsUUID,
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
  public height: number;

  @IsNumberString()
  @IsNotEmpty({ message: "Weight Required" })
  public weight: number;

  @IsOptional()
  @IsDecimal()
  @IsNotEmpty({ message: "BMI Required" })
  public bmi: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Weight Category Required" })
  @IsIn([...Object.values(WeightCategory)])
  public weight_category: string;

  @IsString()
  @IsNotEmpty({ message: "Gender Required" })
  @IsIn([...Object.values(Gender)])
  public gender: string;
}

export class UpdateNutritionHistoryDto {
  @IsOptional()
  @IsNumberString()
  @IsNotEmpty({ message: "Age In Month Required" })
  public age_in_month: number;

  @IsOptional()
  @IsNumberString()
  @IsNotEmpty({ message: "Height Required" })
  public height: number;

  @IsOptional()
  @IsNumberString()
  @IsNotEmpty({ message: "Weight Required" })
  public weight: number;
}

export class ChildrenIdParamDto {
  @IsString()
  @IsNotEmpty({ message: "Children ID Required" })
  public childId: string;
}

export class NutritionHistoryIdParamDto {
  @IsUUID("4", { message: "Invalid Nutrition History ID" })
  @IsNotEmpty({ message: "Nutrition History ID Required" })
  public nutritionHistoryId: string;
}
