/* eslint-disable no-unused-vars */
import {
  IsString,
  IsNumberString,
  IsNotEmpty,
  IsDateString,
  IsIn,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
} from "class-validator";
import { PaginationDto } from "./pagination.dto";

export enum Village {
  ALASDOWO = "Alasdowo",
  BAKALAN = "Bakalan",
  BANYUTOWO = "Banyutowo",
  DUKUHSETI = "Dukuhseti",
  DUMPIL = "Dumpil",
  GROGOLAN = "Grogolan",
  KEMBANG = "Kembang",
  KENANTI = "Kenanti",
  NGAGEL = "Ngagel",
  PUNCEL = "Puncel",
  TEGALOMBO = "Tegalombo",
  WEDUSAN = "Wedusan",
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

  @IsNumberString({ no_symbols: true }, { message: "Child NIK must be a number" })
  @IsNotEmpty({ message: "Child NIK Required" })
  @MinLength(16, { message: "NIK must be 16 characters" })
  @MaxLength(16, { message: "NIK must be 16 characters" })
  public child_nik: number;

  @IsString()
  @IsNotEmpty({ message: "Child Village Required" })
  @IsIn([...Object.values(Village)])
  public child_village: string;

  @IsDateString()
  @IsNotEmpty({ message: "Date of Birth Required" })
  public date_of_birth: Date;

  @IsString()
  @IsNotEmpty({ message: "Age Text Required" })
  @MaxLength(255)
  public age_text: string;

  @IsNumberString({ no_symbols: true }, { message: "Height must be a number" })
  @IsNotEmpty({ message: "Height Required" })
  public height: number;

  @IsNumberString({ no_symbols: true }, { message: "Weight must be a number" })
  @IsNotEmpty({ message: "Weight Required" })
  public weight: number;

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

export class UpdateChildrenDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Child Name Required" })
  @MaxLength(255)
  public child_name: string;

  @IsOptional()
  @IsNumberString({ no_symbols: true }, { message: "Child NIK must be a number" })
  @IsNotEmpty({ message: "Child NIK Required" })
  @MinLength(16, { message: "NIK must be 16 characters" })
  @MaxLength(16, { message: "NIK must be 16 characters" })
  public child_nik: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Child Village Required" })
  @IsIn([...Object.values(Village)])
  public child_village: string;

  @IsOptional()
  @IsDateString()
  @IsNotEmpty({ message: "Date of Birth Required" })
  public date_of_birth: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Gender Required" })
  @IsIn([...Object.values(Gender)])
  public gender: string;
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
