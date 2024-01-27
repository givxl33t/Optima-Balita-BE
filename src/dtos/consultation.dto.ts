import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  IsPhoneNumber,
  IsMobilePhone,
} from "class-validator";
import { PaginationDto } from "./pagination.dto";

export class GetConsultantsQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  public filter: string;
}

export class CreateConsultantDto {
  @IsString()
  @IsNotEmpty({ message: "Description Required" })
  @MaxLength(255)
  public consultant_description: string;

  @IsMobilePhone("id-ID")
  @IsNotEmpty({ message: "Phone Number Required" })
  @IsPhoneNumber("ID")
  @MaxLength(255)
  public consultant_phone: string;

  @IsUUID("4", { message: "Invalid User ID" })
  @IsNotEmpty({ message: "User ID Required" })
  public user_id: string;
}

export class UpdateConsultantDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Description Required" })
  @MaxLength(255)
  public consultant_description: string;

  @IsOptional()
  @IsMobilePhone("id-ID")
  @IsNotEmpty({ message: "Phone Number Required" })
  @IsPhoneNumber("ID")
  @MaxLength(255)
  public consultant_phone: string;
}

export class ConsultantIdParamDto {
  @IsUUID("4", { message: "Invalid Consultant ID" })
  @IsNotEmpty({ message: "Consultant ID Required" })
  public consultantId: string;
}
