import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsNotEmpty,
  IsUUID,
  IsStrongPassword,
  Equals,
} from "class-validator";
import { PaginationDto } from "./pagination.dto";

type IsStrongPasswordOptions = {
  minLength: number;
  minLowercase: number;
  minUppercase: number;
  minNumbers: number;
  minSymbols: number;
};

const strongPasswordOptions: IsStrongPasswordOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 0,
};

export class GetUserQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  public filter: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Username Required" })
  @MaxLength(255)
  public username: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: "Email Required" })
  @MaxLength(255)
  public email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Current Password Required" })
  @MaxLength(255)
  public current_password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "New Password Required" })
  @MaxLength(255)
  @IsStrongPassword(strongPasswordOptions)
  public password?: string;

  @IsOptional()
  @Equals(undefined, { message: "Image Required" })
  public profile?: string;
}

export class UserIdParamDto {
  @IsUUID("4", { message: "Invalid User ID" })
  @IsNotEmpty({ message: "User ID Required" })
  public userId: string;
}

export class UpdateUserDto extends UpdateProfileDto {
  @IsOptional()
  @IsUUID("4", { message: "Invalid Role ID" })
  @IsNotEmpty({ message: "Role ID Required" })
  public role_id?: string;
}
