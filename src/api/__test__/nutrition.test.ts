import request from "supertest";
import App from "@/app";
import NutritionRoute from "@/api/nutrition/nutrition.route";
import AuthRoute from "@/api/auth/auth.route";
import { truncate, updateUserRole } from "@/utils/tests.utils";
import { ADMIN_ID as ADMIN } from "@/utils/constant.utils";
import { v4 as uuidv4 } from "uuid";
import UserRoute from "../user/user.route";

describe("nutrition endpoint", () => {
  let app;
  let nutritionRoute;
  const authRoute = new AuthRoute();
  const userRoute = new UserRoute();
  const users = authRoute.authController.authService.users;
  const userRoles = userRoute.userController.userService.userRoles;
  let nutritionHistories;
  let accessToken;

  beforeAll(async () => {
    app = new App([new AuthRoute(), new NutritionRoute()]);
    nutritionRoute = new NutritionRoute();
    nutritionHistories = nutritionRoute.nutritionController.nutritionService.nutritionHistories;

    const userData = {
      username: "test4",
      email: "test4@gmail.com",
      password: "F4k3P4ssw0rd!",
    };

    await request(app.getServer()).post("/api/auth/register").send(userData);

    const user = await users.findOne({ where: { email: userData.email } });
    const userId = user?.id;
    await updateUserRole(userRoles, userId as string, ADMIN as string);

    const { body } = await request(app.getServer())
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password })
      .expect(201);

    accessToken = body.accessToken;
  });

  afterAll(async () => {
    await truncate({ users, nutritionHistories });
  });

  describe("when GET /api/bmi/children", () => {
    it("should response 200 and returned all children", async () => {
      const res = await request(app.getServer())
        .get("/api/bmi/children")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveLength(0);
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).get("/api/bmi/children").expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/bmi/children")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });
  });

  describe("when GET /api/bmi/children/:childId", () => {
    it("should response 200 and returned all children", async () => {
      const nutritionHistoryData = {
        child_name: "Test Child",
        age_text: "1 tahun 11 bulan",
        height: "100",
        weight: "20",
        bmi: "15.32",
        weight_category: "Underweight",
        gender: "Laki-laki",
      };

      const res1 = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(nutritionHistoryData);

      const res = await request(app.getServer())
        .get(`/api/bmi/children/${res1.body.data.child_id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data).toEqual(
        expect.objectContaining({
          child_name: nutritionHistoryData.child_name,
        }),
      );
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).get("/api/bmi/children/1").expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/bmi/children/1")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });
  });

  describe("when GET /api/bmi/me", () => {
    let secondAccessToken;

    const nutritionHistoryData = {
      child_name: "Test Child",
      age_text: "1 tahun 11 bulan",
      height: "100",
      weight: "20",
      bmi: "15.32",
      weight_category: "Underweight",
      gender: "Laki-laki",
    };

    beforeAll(async () => {
      await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(nutritionHistoryData);

      const userData2 = {
        username: "test5",
        email: "test5@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData2);
      const { body } = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData2.email, password: userData2.password })
        .expect(201);

      secondAccessToken = body.accessToken;
    });

    it("should response 200 and returned all current user nutrition histories", async () => {
      const res1 = await request(app.getServer())
        .get("/api/bmi/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res1.body.data).toBeDefined();
      expect(res1.body.data).toHaveLength(2);

      const res2 = await request(app.getServer())
        .get("/api/bmi/me")
        .set("Authorization", `Bearer ${secondAccessToken}`)
        .expect(200);

      expect(res2.body.data).toBeDefined();
      expect(res2.body.data).toHaveLength(0);
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).get("/api/bmi/me").expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/bmi/me")
        .set("Authorization", "Bearer invalid_token");
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });
  });

  describe("when GET /api/bmi/:nutritionHistoryId", () => {
    const nutritionHistoryData = {
      child_name: "Test Child",
      age_text: "1 tahun 11 bulan",
      height: "100",
      weight: "20",
      bmi: "15.32",
      weight_category: "Underweight",
      gender: "Laki-laki",
    };

    it("should response 200 and returned nutrition history", async () => {
      const res1 = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(nutritionHistoryData);

      const res2 = await request(app.getServer())
        .get(`/api/bmi/${res1.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res2.body.data).toBeDefined();
      expect(res2.body.data).toEqual(
        expect.objectContaining({
          child_name: nutritionHistoryData.child_name,
        }),
      );
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).get("/api/bmi/1").expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/bmi/1")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if nutritionHistoryId is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/bmi/invalid")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.message).toEqual("Invalid Nutrition History ID");
    });

    it("should response 400 if nutrition history not found", async () => {
      const res = await request(app.getServer())
        .get(`/api/bmi/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(res.body.message).toEqual("Nutrition History not found");
    });
  });

  describe("when POST /api/bmi", () => {
    const nutritionHistoryData = {
      child_name: "Test Child",
      age_text: "1 tahun 11 bulan",
      height: "100",
      weight: "20",
      bmi: "15.32",
      weight_category: "Underweight",
      gender: "Laki-laki",
    };

    it("should response 201 and created new nutrition history", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(nutritionHistoryData)
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.child_name).toEqual(nutritionHistoryData.child_name);
      expect(res.body.data.age_text).toEqual(nutritionHistoryData.age_text);
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .send(nutritionHistoryData)
        .expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", "Bearer invalid_token")
        .send(nutritionHistoryData)
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if child_name is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...nutritionHistoryData, child_name: "" })
        .expect(422);
      expect(res.body.message).toEqual("Child Name Required");
    });

    it("should response 422 if age_text is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...nutritionHistoryData, age_text: "" })
        .expect(422);
      expect(res.body.message).toEqual("Age Text Required");
    });

    it("should response 422 if height is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...nutritionHistoryData, height: null })
        .expect(422);
      expect(res.body.message).toEqual("Height Required");
    });

    it("should response 422 if weight is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...nutritionHistoryData, weight: null })
        .expect(422);
      expect(res.body.message).toEqual("Weight Required");
    });

    it("should response 422 if gender is not a valid option", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...nutritionHistoryData, gender: "invalid" })
        .expect(422);
      expect(res.body.message).toEqual(
        "gender must be one of the following values: Laki-laki, Perempuan",
      );
    });
  });

  describe("when PUT /api/bmi/:nutritionHistoryId", () => {
    let nutritionHistoryId;

    const nutritionHistoryData = {
      child_name: "Test Child",
      age_text: "1 tahun 11 bulan",
      height: "100",
      weight: "20",
      bmi: "15.32",
      weight_category: "Underweight",
      gender: "Laki-laki",
    };

    beforeAll(async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(nutritionHistoryData);

      nutritionHistoryId = res.body.data.id;
    });

    it("should response 200 and updated nutrition history", async () => {
      const res = await request(app.getServer())
        .put(`/api/bmi/${nutritionHistoryId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ height: "200" })
        .expect(200);

      expect(res.body.message).toEqual("Nutrition history successfully updated");
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer())
        .put(`/api/bmi/${nutritionHistoryId}`)
        .send(nutritionHistoryData)
        .expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .put(`/api/bmi/${nutritionHistoryId}`)
        .set("Authorization", "Bearer invalid_token")
        .send(nutritionHistoryData)
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if nutritionHistoryId is invalid", async () => {
      const res = await request(app.getServer())
        .put("/api/bmi/invalid")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(nutritionHistoryData)
        .expect(422);
      expect(res.body.message).toEqual("Invalid Nutrition History ID");
    });

    it("should response 400 if nutrition history not found", async () => {
      const res = await request(app.getServer())
        .put(`/api/bmi/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ height: "200" })
        .expect(400);
      expect(res.body.message).toEqual("Nutrition History not found");
    });
  });

  describe("when DELETE /api/bmi/:nutritionHistoryId", () => {
    let nutritionHistoryId;

    const nutritionHistoryData = {
      child_name: "Test Child",
      age_text: "1 tahun 11 bulan",
      height: "100",
      weight: "20",
      bmi: "15.32",
      weight_category: "Underweight",
      gender: "Laki-laki",
    };

    beforeAll(async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(nutritionHistoryData);

      nutritionHistoryId = res.body.data.id;
    });

    it("should response 200 and deleted nutrition history", async () => {
      const res = await request(app.getServer())
        .delete(`/api/bmi/${nutritionHistoryId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toEqual("Nutrition history successfully deleted");
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer())
        .delete(`/api/bmi/${nutritionHistoryId}`)
        .expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .delete(`/api/bmi/${nutritionHistoryId}`)
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if nutritionHistoryId is invalid", async () => {
      const res = await request(app.getServer())
        .delete("/api/bmi/invalid")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.message).toEqual("Invalid Nutrition History ID");
    });

    it("should response 400 if nutrition history not found", async () => {
      const res = await request(app.getServer())
        .delete(`/api/bmi/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(res.body.message).toEqual("Nutrition History not found");
    });
  });
});
