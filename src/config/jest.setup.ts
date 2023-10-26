import DB from "./database";

afterAll(async () => {
  await DB.sequelize.close();
});
