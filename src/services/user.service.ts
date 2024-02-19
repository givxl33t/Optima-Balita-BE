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
import PasswordHasher from "@/utils/passwordHasher.utils";
import uploadImageToCloudinary from "@/utils/uploadImage.utils";
import { UploadApiOptions } from "cloudinary";
import { CLOUDINARY_CLOUD_NAME } from "@/utils/constant.utils";
import { v4 as uuidv4 } from "uuid";
import { extractPublicId } from "cloudinary-build-url";

class UserService {
  public users = DB.UserModel;
  public roles = DB.RoleModel;
  public userRoles = DB.UserRoleModel;

  public getUser = async (userId: string): Promise<UserInterface> => {
    const findUser = await this.users.findOne({
      where: { id: userId },
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
    const whereClause = {
      id: {
        [Op.ne]: currUserId,
      },
    };
    if (filter) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${filter}%` } },
        { email: { [Op.iLike]: `%${filter}%` } },
      ];
    }

    const users = await this.users.findAndCountAll({
      include: [
        {
          model: this.roles,
          as: "roles",
          attributes: ["name"],
        },
      ],
      where: whereClause,
      order: [["created_at", "DESC"]],
      offset: !isNaN(offset) ? offset : undefined,
      limit: !isNaN(limit) ? limit : undefined,
    });

    const { rows, count } = users;
    const meta = !isNaN(offset) && !isNaN(limit) ? metaBuilder(offset, limit, count) : undefined;
    return { rows: this.mappedUsers(rows), meta };
  };

  public updateUser = async (
    userData: UpdateUserDto,
    userId: string,
    profileImageFile?: Buffer,
  ): Promise<void> => {
    const existingUser = await this.users.findOne({
      where: { id: userId },
    });
    if (!existingUser) throw new HttpExceptionBadRequest("User not found");

    if (userData.email) {
      const findUser = await this.users.findOne({
        where: { email: userData.email },
      });

      if (findUser && findUser.id !== userId)
        throw new HttpExceptionBadRequest("Email already exists");
    }

    if (userData.current_password && userData.password) {
      const isPasswordMatch = await PasswordHasher.comparePassword(
        userData.current_password,
        existingUser.password,
      );
      if (!isPasswordMatch) throw new HttpExceptionBadRequest("Invalid password");

      const hashedPassword = await PasswordHasher.hashPassword(userData.password as string);
      userData.password = hashedPassword;
    }

    if (profileImageFile) {
      let options: UploadApiOptions;

      if (existingUser.profile.includes(CLOUDINARY_CLOUD_NAME as string)) {
        const publicId = extractPublicId(existingUser.profile);
        options = { public_id: publicId, invalidate: true };
      } else {
        options = { public_id: `user_${uuidv4()}`, folder: "user" };
      }

      userData.profile = (await uploadImageToCloudinary(options, profileImageFile)).secure_url;
    }

    await this.users.update(userData, {
      where: { id: userId },
    });

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
      individualHooks: true,
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
