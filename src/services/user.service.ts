import DB from "@/config/database";
import { UserInterface, MappedUserInterface } from "@interfaces/user.interface";
import { HttpExceptionBadRequest } from "@/exceptions/HttpException";
import { UpdateUserDto } from "@/dtos/user.dto";

class UserService {
  public users = DB.UserModel;
  public roles = DB.RoleModel;
  public userRoles = DB.UserRoleModel;

  public getUser = async (userId: string): Promise<UserInterface> => {
    const findUser = await this.users.findOne({
      where: { id: userId },
    });
    if (!findUser) throw new HttpExceptionBadRequest("User not found");

    return {
      username: findUser.username,
      email: findUser.email,
      profile: findUser.profile,
    };
  };

  public getUsers = async (currUserId: string): Promise<UserInterface[]> => {
    const users = await this.users.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: this.roles,
          as: "roles",
          through: { attributes: [] },
        },
      ],
    });

    return this.mappedUsers(users, currUserId);
  };

  public updateUser = async (userData: UpdateUserDto, userId: string): Promise<void> => {
    const findUser = await this.users.findOne({
      where: { id: userId },
    });
    if (!findUser) throw new HttpExceptionBadRequest("User not found");

    await this.users.update(
      { ...userData },
      {
        where: { id: userId },
      },
    );

    if (userData.role_id) {
      const findRole = await this.roles.findOne({
        where: { id: userData.role_id },
      });
      if (!findRole) throw new HttpExceptionBadRequest("Role not found");

      await this.userRoles.update(
        { role_id: userData.role_id },
        {
          where: { user_id: userId },
        },
      );
    }
  };

  public deleteUser = async (userId: string): Promise<void> => {
    const findUser = await this.users.findOne({
      where: { id: userId },
    });
    if (!findUser) throw new HttpExceptionBadRequest("User not found");

    await this.users.destroy({
      where: { id: userId },
    });

    await this.userRoles.destroy({
      where: { user_id: userId },
    });
  };

  public mappedUsers = (users: UserInterface[], currUserId: string): MappedUserInterface[] => {
    users = users.filter((user) => user.id !== currUserId);
    return users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.roles ? user.roles[0].name : undefined,
      };
    });
  };
}

export default UserService;
