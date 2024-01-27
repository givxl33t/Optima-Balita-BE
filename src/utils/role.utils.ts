import DB from "@/config/database";
import { HttpExceptionNotFound } from "@/exceptions/HttpException";

const users = DB.UserModel;
const roles = DB.RoleModel;

export const getRoleNameFromUserId = async (userId: string): Promise<string> => {
  const user = await users.findOne({
    where: { id: userId },
    attributes: ["id"],
    include: [
      {
        model: roles,
        as: "roles",
        attributes: ["name"],
      },
    ],
  });
  if (!user) throw new HttpExceptionNotFound("User not found");

  return user.roles[0].name;
};
