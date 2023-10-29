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
  let auths;

  beforeAll(async () => {
    app = new App([new AuthRoute()]);
    authRoute = new AuthRoute();
    users = authRoute.authController.authService.users;
    userRoles = authRoute.authController.authService.userRoles;
    auths = authRoute.authController.authService.auths;
  });

  afterEach(async () => {
    await truncate({ users, userRoles, auths });
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

  describe("when POST /api/auth/login", () => {
    let userData: RegisterUserDto;

    beforeAll(async () => {
      userData = {
        username: "test",
        email: "test@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData).expect(201);
    });

    it("should response 201 and token", async () => {
      const response = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(201);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should response 400 when email is not registered", async () => {
      const response = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: "wakanda1@gmail.com", password: userData.password })
        .expect(400);
      expect(response.body.message).toEqual("Incorrect email or password");
    });

    it("should response 400 when password is incorrect", async () => {
      const response = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password + "1" })
        .expect(400);
      expect(response.body.message).toEqual("Incorrect email or password");
    });

    it("should response 422 when request payload not contain needed property", async () => {
      const response = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: "" })
        .expect(422);
      expect(response.body.message).toEqual("Password Required");
    });

    it("should response 422 when request payload not meet data type specification", async () => {
      const response = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: 123 })
        .expect(422);
      expect(response.body.message).toEqual(
        "password must be shorter than or equal to 25 characters",
      );
    });
  });

  describe("when PUT /api/auth/refresh", () => {
    let userData;
    let loginResponse;
    let refreshToken;

    beforeAll(async () => {
      userData = {
        username: "test",
        email: "test@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData).expect(201);

      loginResponse = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(201);
    });

    it("should response 200 and new access token", async () => {
      const response = await request(app.getServer())
        .put("/api/auth/refresh")
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(200);

      refreshToken = response.body.refreshToken;
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should response 401 if refresh token not found in database", async () => {
      await auths.destroy({ where: { token: loginResponse.body.refreshToken } });

      const response = await request(app.getServer())
        .put("/api/auth/refresh")
        .send({ refreshToken })
        .expect(401);
      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 payload not contain refresh token", async () => {
      const response = await request(app.getServer())
        .put("/api/auth/refresh")
        .send({ refreshToken: "" })
        .expect(422);
      expect(response.body.message).toEqual("Refresh Token Required");
    });

    it("should response 422 if refresh token not string", async () => {
      const response = await request(app.getServer())
        .put("/api/auth/refresh")
        .send({ refreshToken: 123 })
        .expect(422);
      expect(response.body.message).toEqual("refreshToken must be a string");
    });

    it("should response 401 when refresh token is invalid", async () => {
      const response = await request(app.getServer())
        .put("/api/auth/refresh")
        .send({ refreshToken: "ergreergeg" })
        .expect(401);
      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });
  });

  describe("when DELETE /api/auth/logout", () => {
    let userData;
    let loginResponse;

    beforeAll(async () => {
      userData = {
        username: "test",
        email: "test@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData).expect(201);

      loginResponse = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(201);
    });

    it("should response 200 if refresh token is valid", async () => {
      await request(app.getServer())
        .delete("/api/auth/logout")
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(200);

      const findToken = await auths.findOne({ where: { token: loginResponse.body.refreshToken } });
      expect(findToken).toBeNull();
    });

    it("should response 401 if refresh token not found in database", async () => {
      const response = await request(app.getServer())
        .delete("/api/auth/logout")
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(401);
      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 payload not contain refresh token", async () => {
      const response = await request(app.getServer())
        .delete("/api/auth/logout")
        .send({ refreshToken: "" })
        .expect(422);
      expect(response.body.message).toEqual("Refresh Token Required");
    });

    it("should response 422 if refresh token not string", async () => {
      const response = await request(app.getServer())
        .delete("/api/auth/logout")
        .send({ refreshToken: 123 })
        .expect(422);
      expect(response.body.message).toEqual("refreshToken must be a string");
    });
  });

  describe("when GET /api/auth/me", () => {
    let userData;
    let loginResponse;

    beforeAll(async () => {
      userData = {
        username: "test",
        email: "test@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData).expect(201);
    });

    it("should response 200 and user data", async () => {
      loginResponse = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(201);

      const response = await request(app.getServer())
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("username");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data).toHaveProperty("profile");
    });

    it("should response 401 when access token is invalid", async () => {
      const response = await request(app.getServer())
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}1`)
        .expect(401);
      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 401 when no access token provided", async () => {
      const response = await request(app.getServer()).get("/api/auth/me").expect(401);
      expect(response.body.message).toEqual("Authorization Header missing.");
    });
  });
});
