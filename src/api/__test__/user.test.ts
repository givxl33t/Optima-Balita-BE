import request from "supertest";
import App from "@/app";
import AuthRoute from "@/api/auth/auth.route";
import UserRoute from "@/api/user/user.route";
import { truncate, updateUserRole } from "@/utils/tests.utils";
import { ADMIN_ID as ADMIN } from "@/utils/constant.utils";

describe("users endpoint", () => {
  let app;
  let userRoute;
  let users;
  let userRoles;
  let userData;
  let loginResponse;
  let userId;

  beforeAll(async () => {
    app = new App([new AuthRoute(), new UserRoute()]);
    userRoute = new UserRoute();
    users = userRoute.userController.userService.users;
    userRoles = userRoute.userController.userService.userRoles;

    userData = {
      username: "test",
      email: "test@gmail.com",
      password: "F4k3P4ssw0rd!",
    };
    await request(app.getServer()).post("/api/auth/register").send(userData).expect(201);

    const user = await users.findOne({ where: { email: userData.email } });
    userId = user.id;
    await updateUserRole(userRoles, userId, ADMIN as string);

    loginResponse = await request(app.getServer())
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password })
      .expect(201);
  });

  afterEach(async () => {
    await truncate({ users, userRoles });
  });

  describe("when GET /api/user", () => {
    it("should response 200 and returned users", async () => {
      const res = await request(app.getServer())
        .get("/api/user")
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toEqual([]);
    });

    it("should response 200 and excluded current user", async () => {
      const userData2 = {
        username: "test2",
        email: "test2@gmail.com",
        password: "F4k3P4ssw0rd!",
      };
      await request(app.getServer()).post("/api/auth/register").send(userData2).expect(201);

      const res = await request(app.getServer())
        .get("/api/user")
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: userData.email,
          }),
        ]),
      );
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).get("/api/user").expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/user")
        .set("Authorization", "Bearer invalid_token");
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 if user is not admin", async () => {
      const userData2 = {
        username: "test2",
        email: "test2@gmail.com",
        password: "F4k3P4ssw0rd!",
      };
      await request(app.getServer()).post("/api/auth/register").send(userData2).expect(201);

      const { body } = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData2.email, password: userData2.password })
        .expect(201);

      const res = await request(app.getServer())
        .get("/api/user")
        .set("Authorization", `Bearer ${body.accessToken}`)
        .expect(403);
      expect(res.body.message).toEqual("You do not have permission to access this resource");
    });
  });

  describe("when GET /api/user/:userId", () => {
    it("should response 200 and returned user", async () => {
      // create user
      const userData2 = {
        username: "test2",
        email: "test2@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData2).expect(201);

      const user = await users.findOne({ where: { email: userData2.email } });
      const userId2 = user.id;

      const res = await request(app.getServer())
        .get(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toEqual(
        expect.objectContaining({
          email: userData2.email,
        }),
      );
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).get(`/api/user/${userId}`).expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .get(`/api/user/${userId}`)
        .set("Authorization", "Bearer invalid_token");
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 if user is not admin", async () => {
      const userData2 = {
        username: "test2",
        email: "test2@gmail.com",
        password: "F4k3P4ssw0rd!",
      };
      await request(app.getServer()).post("/api/auth/register").send(userData2).expect(201);
    });

    it("should response 422 if userId is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/user/invalid_user_id")
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(422);
      expect(res.body.message).toEqual("Invalid User ID");
    });

    it("should response 400 if userId is not found", async () => {
      const res = await request(app.getServer())
        .get(`/api/user/${userId}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(400);
      expect(res.body.message).toEqual("User not found");
    });
  });

  describe("when PUT /api/user/:userId", () => {
    let userId2;

    const userData2 = {
      username: "test2",
      email: "test2@gmail.com",
      password: "F4k3P4ssw0rd!",
    };

    beforeEach(async () => {
      await request(app.getServer()).post("/api/auth/register").send(userData2).expect(201);
    });

    it("should response 200 and updated user", async () => {
      const user = await users.findOne({ where: { email: userData2.email } });
      userId2 = user.id;

      const res = await request(app.getServer())
        .put(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .send({ username: "test3" })
        .expect(200);
      expect(res.body.message).toEqual("User successfully updated");
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).put(`/api/user/${userId2}`).expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .put(`/api/user/${userId2}`)
        .set("Authorization", "Bearer invalid_token")
        .send({ username: "test3" })
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 if user is not admin", async () => {
      const { body } = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData2.email, password: userData2.password })
        .expect(201);

      const res = await request(app.getServer())
        .put(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${body.accessToken}`)
        .send({ username: "test3" })
        .expect(403);
      expect(res.body.message).toEqual("You do not have permission to access this resource");
    });

    it("should response 422 if userId is invalid", async () => {
      const res = await request(app.getServer())
        .put("/api/user/invalid_user_id")
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .send({ username: "test3" })
        .expect(422);
      expect(res.body.message).toEqual("Invalid User ID");
    });

    it("should response 422 if username is empty", async () => {
      const res = await request(app.getServer())
        .put(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .send({ username: "" })
        .expect(422);
      expect(res.body.message).toEqual("Username Required");
    });

    it("should response 422 if email is empty", async () => {
      const res = await request(app.getServer())
        .put(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .send({ email: "" })
        .expect(422);
      expect(res.body.message).toEqual("Email Required");
    });

    it("should response 422 if email is invalid", async () => {
      const res = await request(app.getServer())
        .put(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .send({ email: "invalid_email" })
        .expect(422);
      expect(res.body.message).toEqual("email must be an email");
    });

    it("should response 422 if roleId is invalid", async () => {
      const res = await request(app.getServer())
        .put(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .send({ role_id: "invalid_role_id" })
        .expect(422);
      expect(res.body.message).toEqual("Invalid Role ID");
    });
  });

  describe("when DELETE /api/user/:userId", () => {
    let userId2;

    const userData2 = {
      username: "test2",
      email: "test2@gmail.com",
      password: "F4k3P4ssw0rd!",
    };

    beforeEach(async () => {
      await request(app.getServer()).post("/api/auth/register").send(userData2).expect(201);
    });

    it("should response 200 and deleted user", async () => {
      const user = await users.findOne({ where: { email: userData2.email } });
      userId2 = user.id;

      const res = await request(app.getServer())
        .delete(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);
      expect(res.body.message).toEqual("User successfully deleted");
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).delete(`/api/user/${userId2}`).expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .delete(`/api/user/${userId2}`)
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 if user is not admin", async () => {
      const { body } = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData2.email, password: userData2.password })
        .expect(201);

      const res = await request(app.getServer())
        .delete(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${body.accessToken}`)
        .expect(403);
      expect(res.body.message).toEqual("You do not have permission to access this resource");
    });

    it("should response 422 if userId is invalid", async () => {
      const res = await request(app.getServer())
        .delete("/api/user/invalid_user_id")
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(422);
      expect(res.body.message).toEqual("Invalid User ID");
    });

    it("should response 400 if userId is not found", async () => {
      const res = await request(app.getServer())
        .delete(`/api/user/${userId2}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(400);
      expect(res.body.message).toEqual("User not found");
    });
  });
});
