import request from "supertest";
import App from "@/app";
import { RegisterUserDto } from "@/dtos/auth.dto";
import AuthRoute from "@/api/auth/auth.route";
import { truncate } from "@/utils/tests.utils";

describe("authentications endpoint", () => {
  let app;
  let authRoute;
  let users;
  let userRoles;

  beforeAll(async () => {
    app = new App([new AuthRoute()]);
    authRoute = new AuthRoute();
    users = authRoute.authController.authService.users;
    userRoles = authRoute.authController.authService.userRoles;
  });

  afterEach(async () => {
    await truncate({ users, userRoles });
  });

  describe("when POST /api/auth/register", () => {
    it("should response 201 and persisted user", async () => {
      const userData: RegisterUserDto = {
        username: "test",
        email: "test@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData).expect(201);
    });

    it("should response 422 if when request payload not contain needed property", async () => {
      const userData = {
        username: "test",
        email: "test2@gmail.com",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData).expect(422);
    });

    it("should response 422 when request payload not meet data type specification", async () => {
      const userData = {
        username: "test",
        email: "test3@gmail.com",
        password: 123,
      };

      await request(app.getServer()).post("/api/auth/register").send(userData).expect(422);
    });

    it("should response 422 when password is not strong enough", async () => {
      const userData = {
        username: "test",
        email: "test4@gmail.com",
        password: "123",
      };

      const response = await request(app.getServer())
        .post("/api/auth/register")
        .send(userData)
        .expect(422);
      expect(response.body.message).toEqual("password is not strong enough");
    });

    it("should response 400 when email is already registered", async () => {
      const userData = {
        username: "test",
        email: "test5@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData).expect(201);

      const response = await request(app.getServer())
        .post("/api/auth/register")
        .send(userData)
        .expect(400);
      expect(response.body.message).toEqual("Email already exists");
    });
  });
});
