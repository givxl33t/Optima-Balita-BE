import DB from "@/config/database";
import {
  UserInterface,
  MappedUserInterface,
  PaginatedUserInterface,
} from "@interfaces/user.interface";
import { HttpExceptionBadRequest } from "@/exceptions/HttpException";
import { UpdateUserDto } from "@/dtos/user.dto";
import { metaBuilder } from "@/utils/pagination.utils";
import { Op } from "sequelize";

class UserService {
  public users = DB.UserModel;
  public roles = DB.RoleModel;
  public userRoles = DB.UserRoleModel;

  public getUser = async (userId: string): Promise<UserInterface> => {
    const findUser = await this.users.findOne({
      where: { id: userId },
      attributes: ["id", "username", "email", "profile", "created_at"],
      include: [
        {
          model: this.roles,
          as: "roles",
          attributes: ["name"],
        },
      ],
    });
    if (!findUser) throw new HttpExceptionBadRequest("User not found");

    return this.mappedUsers([findUser])[0];
  };

  public getUsers = async (
    offset: number,
    limit: number,
    currUserId: string,
    filter?: string,
  ): Promise<PaginatedUserInterface> => {
    let meta;
    let users;

    const whereClause = {
      id: {
        [Op.ne]: currUserId,
      },
    };
    if (filter) {
      whereClause[Op.or] = [
        {
          username: {
            [Op.iLike]: `%${filter}%`,
          },
        },
        {
          email: {
            [Op.iLike]: `%${filter}%`,
          },
        },
      ];
    }

    if (!isNaN(offset) && !isNaN(limit)) {
      users = await this.users.findAndCountAll({
        attributes: ["id", "username", "email", "profile", "created_at"],
        include: [
          {
            model: this.roles,
            as: "roles",
            attributes: ["name"],
          },
        ],
        where: whereClause,
        order: [["created_at", "DESC"]],
        offset,
        limit,
      });

      const { rows, count } = users;
      meta = metaBuilder(offset, limit, count);
      return { rows: this.mappedUsers(rows), meta };
    } else {
      users = await this.users.findAll({
        attributes: ["id", "username", "email", "profile", "created_at"],
        where: whereClause,
        include: [
          {
            model: this.roles,
            as: "roles",
            attributes: ["name"],
          },
        ],
        order: [["created_at", "DESC"]],
      });
      return { rows: this.mappedUsers(users), meta };
    }
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

  public mappedUsers = (users: UserInterface[]): MappedUserInterface[] => {
    return users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.roles ? user.roles[0].name : undefined,
        created_at: user.created_at,
      };
    });
  };
}

export default UserService;
