/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// Desc: Utility functions for testing

export const truncate = async (models: any) => {
  return await Promise.all(
    Object.keys(models).map((key) => {
      if (["sequelize", "Sequelize"].includes(key)) return null;
      return models[key].destroy({ where: {}, force: true });
    }),
  );
};

export const updateUserRole = async (userRoleModel: any, userId: string, roleId: string) => {
  return await userRoleModel.update({ role_id: roleId }, { where: { user_id: userId } });
};
