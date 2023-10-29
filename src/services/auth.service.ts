import DB from "@/config/database";
import { HttpExceptionBadRequest, HttpExceptionUnauthorize } from "@exceptions/HttpException";
import PasswordHasher from "@/utils/passwordHasher.utils";
import { UserInterface, TokenInterface } from "@interfaces/user.interface";
import { RegisterUserDto, LoginUserDto, TokenManageDto } from "@/dtos/auth.dto";
import { GUEST_ID } from "@/utils/constant.utils";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/utils/jwt.utils";
import { JwtPayload } from "jsonwebtoken";

class AuthService {
  public users = DB.UserModel;
  public auths = DB.AuthModel;
  public userRoles = DB.UserRoleModel;
  public roles = DB.RoleModel;

  public register = async (userData: RegisterUserDto): Promise<UserInterface> => {
    const findUser = await this.users.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpExceptionBadRequest("Email already exists");

    const hashedPassword = await PasswordHasher.hashPassword(userData.password);
    const user: UserInterface = await this.users.create({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      profile: "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg", //temporary
    });

    await this.userRoles.create({
      user_id: user.id,
      role_id: GUEST_ID,
    });

    return {
      username: user.username,
      email: user.email,
      profile: user.profile,
    };
  };

  public login = async (userData: LoginUserDto): Promise<TokenInterface> => {
    const findUser = await this.users.findOne({
      where: { email: userData.email.toLowerCase() },
      include: [
        {
          model: this.roles,
          as: "roles",
          through: { attributes: [] },
        },
      ],
    });

    if (!findUser) throw new HttpExceptionBadRequest("Incorrect email or password");

    const isPasswordValid = await PasswordHasher.comparePassword(
      userData.password,
      findUser.password,
    );
    if (!isPasswordValid) throw new HttpExceptionBadRequest("Incorrect email or password");

    const tokenPayload: JwtPayload = {
      user_id: findUser.id,
      role_id: findUser.roles[0].id,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    await this.auths.create({
      token: refreshToken,
    });

    const token = {
      refreshToken,
      accessToken,
    };

    return token;
  };

  public refresh = async (tokenData: TokenManageDto): Promise<TokenInterface> => {
    const decodedToken: JwtPayload = verifyRefreshToken(tokenData.refreshToken);
    const findToken = await this.auths.findOne({
      where: { token: tokenData.refreshToken },
    });
    if (!findToken)
      throw new HttpExceptionUnauthorize("Invalid or Expired token. Please login again.");

    const tokenPayload: JwtPayload = {
      user_id: decodedToken.user_id,
      role_id: decodedToken.role_id,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    await this.auths.update(
      { token: refreshToken },
      {
        where: { token: tokenData.refreshToken },
      },
    );

    const token = {
      refreshToken,
      accessToken,
    };

    return token;
  };

  public logout = async (tokenData: TokenManageDto): Promise<void> => {
    const findToken = await this.auths.findOne({
      where: { token: tokenData.refreshToken },
    });
    if (!findToken)
      throw new HttpExceptionUnauthorize("Invalid or Expired token. Please login again.");

    await this.auths.destroy({
      where: { token: tokenData.refreshToken },
    });
  };

  public getUserById = async (user_id: string): Promise<UserInterface> => {
    const findUser = await this.users.findOne({
      where: { id: user_id },
    });
    if (!findUser) throw new HttpExceptionBadRequest("User not found");

    return {
      username: findUser.username,
      email: findUser.email,
      profile: findUser.profile,
    };
  };
}

export default AuthService;
