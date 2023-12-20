import { IsString, IsOptional, IsEmail, MaxLength, IsNotEmpty, IsUUID } from "class-validator";

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
