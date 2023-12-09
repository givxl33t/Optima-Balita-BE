import request from "supertest";
import App from "@/app";
import { CreateNutritionHistoryDto } from "@/dtos/nutrition.dto";
import NutritionRoute from "@/api/nutrition/nutrition.route";
import AuthRoute from "@/api/auth/auth.route";
import { truncate } from "@/utils/tests.utils";

describe("nutrition endpoint", () => {
  let app;
  let nutritionRoute;
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
    const { body } = await request(app.getServer())
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password })
      .expect(201);

    accessToken = body.accessToken;
  });

  afterEach(async () => {
    await truncate({ nutritionHistories });
  });

  describe("when GET /api/bmi/me", () => {
    let secondAccessToken;

    const nutritionHistoryData: CreateNutritionHistoryDto = {
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
      expect(res1.body.data).toHaveLength(1);

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

  describe("when POST /api/bmi", () => {
    const nutritionHistoryData: CreateNutritionHistoryDto = {
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

    it("should response 422 if bmi is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...nutritionHistoryData, bmi: null })
        .expect(422);
      expect(res.body.message).toEqual("BMI Required");
    });

    it("should response 422 if weight_category is not a valid option", async () => {
      const res = await request(app.getServer())
        .post("/api/bmi")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...nutritionHistoryData, weight_category: "invalid" })
        .expect(422);
      expect(res.body.message).toEqual(
        "weight_category must be one of the following values: Normal, Underweight, Overweight, Obesity",
      );
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
});
