import { IsString, IsEmail, MaxLength, IsStrongPassword, IsNotEmpty } from "class-validator";

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

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty({ message: "Username Required" })
  @MaxLength(255)
  public username: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: "Email Required" })
  @MaxLength(255)
  public email: string;

  @IsString()
  @IsNotEmpty({ message: "Password Required" })
  @MaxLength(25)
  @IsStrongPassword(strongPasswordOptions)
  public password: string;
}

export class LoginUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: "Email Required" })
  @MaxLength(255)
  public email: string;

  @IsString()
  @IsNotEmpty({ message: "Password Required" })
  @MaxLength(25)
  public password: string;
}

export class TokenManageDto {
  @IsString()
  @IsNotEmpty({ message: "Refresh Token Required" })
  public refreshToken: string;
}
