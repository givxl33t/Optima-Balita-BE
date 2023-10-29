import request from "supertest";
import App from "@/app";
import { CreateArticleDto } from "@/dtos/article.dto";
import ArticleRoute from "@/api/article/article.route";
import AuthRoute from "@/api/auth/auth.route";
import { truncate } from "@/utils/tests.utils";

describe("articles endpoint", () => {
  let app;
  let articleRoute;
  let articles;
  let accessToken;

  beforeAll(async () => {
    app = new App([new AuthRoute(), new ArticleRoute()]);
    articleRoute = new ArticleRoute();
    articles = articleRoute.articleController.articleService.articles;

    const userData = {
      username: "test2",
      email: "test2@gmail.com",
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
    await truncate({ articles });
  });

  describe("when GET /api/article", () => {
    const page = 1;
    const limit = 3;
    const articleData: CreateArticleDto = {
      title: "test title",
      description: "test description",
      content: "test content",
    };

    beforeEach(async () => {
      await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);
    });

    it("should response 200 and returned all articles", async () => {
      const res = await request(app.getServer()).get("/api/article").expect(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveLength(1);
    });

    it("should response 200 and returned all articles with pagination", async () => {
      const res = await request(app.getServer())
        .get(`/api/article?page=${page}&limit=${limit}`)
        .expect(200);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toEqual(page);
      expect(res.body.meta.per_page).toEqual(limit);
      expect(res.body.meta.page_size).toEqual(1);
      expect(res.body.meta.total_data).toEqual(1);
    });

    it("should response 200 and paginate the articles properly", async () => {
      for (let i = 0; i < limit + 1; i++) {
        await request(app.getServer())
          .post("/api/article")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(articleData);
      }

      const res = await request(app.getServer())
        .get(`/api/article?page=${page}&limit=${limit}`)
        .expect(200);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toEqual(page);
      expect(res.body.meta.per_page).toEqual(limit);
      expect(res.body.meta.page_size).toEqual(2);
      expect(res.body.meta.total_data).toEqual(5);
    });

    it("should response 422 if page is not a number", async () => {
      const res = await request(app.getServer())
        .get(`/api/article?page=abc&limit=${limit}`)
        .expect(422);
      expect(res.body.message).toEqual("page must be a number string");
    });

    it("should response 422 if limit is not a number", async () => {
      const res = await request(app.getServer())
        .get(`/api/article?page=${page}&limit=abc`)
        .expect(422);
      expect(res.body.message).toEqual("limit must be a number string");
    });

    it("should response 422 if sort is not a valid option", async () => {
      const res = await request(app.getServer())
        .get(`/api/article?page=${page}&limit=${limit}&sort=abc`)
        .expect(422);
      expect(res.body.message).toEqual("sort must be one of the following values: RANDOM");
    });
  });

  describe("when POST /api/article", () => {
    const articleData: CreateArticleDto = {
      title: "test title",
      description: "test description",
      content: "test content",
    };

    it("should response 201 and created an article", async () => {
      const res = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData)
        .expect(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toEqual(articleData.title);
      expect(res.body.data.description).toEqual(articleData.description);
      expect(res.body.data.content).toEqual(articleData.content);
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).post("/api/article").send(articleData).expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", "Bearer invalid_token")
        .send(articleData)
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if title is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, title: "" })
        .expect(422);
      expect(res.body.message).toEqual("Title Required");
    });

    it("should response 422 if description is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, description: "" })
        .expect(422);
      expect(res.body.message).toEqual("Description Required");
    });

    it("should response 422 if content is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, content: "" })
        .expect(422);
      expect(res.body.message).toEqual("Content Required");
    });
  });
});
