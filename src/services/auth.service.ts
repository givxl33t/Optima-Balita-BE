import DB from "@/config/database";
import { HttpExceptionBadRequest } from "@exceptions/HttpException";
import PasswordHasher from "@/utils/passwordHasher.utils";
import { UserInterface } from "@interfaces/user.interface";
import { RegisterUserDto } from "@/dtos/auth.dto";
import { GUEST_ID } from "@/utils/constant.utils";

class AuthService {
  public users = DB.UserModel;
  public userRoles = DB.UserRoleModel;

  public register = async (userData: RegisterUserDto): Promise<UserInterface> => {
    const findUser = await this.users.findOne({ where: { email: userData.email } });

    if (findUser) throw new HttpExceptionBadRequest("Email already exists");

    const hashedPassword = await PasswordHasher.hashPassword(userData.password);

    const user: UserInterface = await this.users.create({
      ...userData,
      password: hashedPassword,
      profile: "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg", //temporary
    });

    await this.userRoles.create({
      user_id: user.id,
      role_id: GUEST_ID,
    });

    return user;
  };
}

export default AuthService;
