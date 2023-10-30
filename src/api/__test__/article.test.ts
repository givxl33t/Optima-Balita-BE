import request from "supertest";
import App from "@/app";
import { CreateArticleDto, UpdateArticleDto } from "@/dtos/article.dto";
import ArticleRoute from "@/api/article/article.route";
import AuthRoute from "@/api/auth/auth.route";
import { truncate } from "@/utils/tests.utils";
import { v4 as uuidv4 } from "uuid";

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

  describe("when GET /api/article/:articleId", () => {
    const articleData: CreateArticleDto = {
      title: "test title",
      description: "test description",
      content: "test content",
    };

    it("should response 200 and returned an article", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const res = await request(app.getServer())
        .get(`/api/article/${article.body.data.id}`)
        .expect(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toEqual(articleData.title);
      expect(res.body.data.description).toEqual(articleData.description);
      expect(res.body.data.content).toEqual(articleData.content);
    });

    it("should response 422 if articleId is invalid", async () => {
      const res = await request(app.getServer()).get("/api/article/invalid_article_id").expect(422);
      expect(res.body.message).toEqual("Invalid Article ID");
    });

    it("should response 400 if article is not found", async () => {
      const res = await request(app.getServer()).get(`/api/article/${uuidv4()}`).expect(400);
      expect(res.body.message).toEqual("Article not found");
    });
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

  describe("when PUT /api/article/:articleId", () => {
    const articleData: UpdateArticleDto = {
      title: "test title xxx",
      description: "test description xxx",
      content: "test content xxx",
    };

    it("should response 200 and updated an article", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const res = await request(app.getServer())
        .put(`/api/article/${article.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, title: "updated title" })
        .expect(200);
      expect(res.body.message).toEqual("Article successfully updated");
    });

    it("should response 401 if token is not provided", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const res = await request(app.getServer())
        .put(`/api/article/${article.body.data.id}`)
        .send({ ...articleData, title: "updated title" })
        .expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const res = await request(app.getServer())
        .put(`/api/article/${article.body.data.id}`)
        .set("Authorization", "Bearer invalid_token")
        .send({ ...articleData, title: "updated title" })
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 if user is not the author of the article", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const userData = {
        username: "test3",
        email: "test3@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData);

      const { body } = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(201);

      const res = await request(app.getServer())
        .put(`/api/article/${article.body.data.id}`)
        .set("Authorization", `Bearer ${body.accessToken}`)
        .send({ ...articleData, title: "updated title" })
        .expect(403);
      expect(res.body.message).toEqual("You are not the author of this article");
    });

    it("should response 422 if articleId is invalid", async () => {
      const res = await request(app.getServer())
        .put("/api/article/invalid_article_id")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, title: "updated title" })
        .expect(422);
      expect(res.body.message).toEqual("Invalid Article ID");
    });

    it("should response 400 if article is not found", async () => {
      const res = await request(app.getServer())
        .put(`/api/article/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, title: "updated title" })
        .expect(400);

      expect(res.body.message).toEqual("Article not found");
    });

    it("should response 422 if title is empty", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const res = await request(app.getServer())
        .put(`/api/article/${article.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, title: "" })
        .expect(422);
      expect(res.body.message).toEqual("Title Required");
    });

    it("should response 422 if description is empty", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const res = await request(app.getServer())
        .put(`/api/article/${article.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, description: "" })
        .expect(422);
      expect(res.body.message).toEqual("Description Required");
    });

    it("should response 422 if content is empty", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const res = await request(app.getServer())
        .put(`/api/article/${article.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...articleData, content: "" })
        .expect(422);
      expect(res.body.message).toEqual("Content Required");
    });
  });

  describe("when DELETE /api/article/:articleId", () => {
    const articleData: CreateArticleDto = {
      title: "test title",
      description: "test description",
      content: "test content",
    };

    it("should response 200 and deleted an article", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      await request(app.getServer())
        .delete(`/api/article/${article.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
    });

    it("should response 401 if token is not provided", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      await request(app.getServer()).delete(`/api/article/${article.body.data.id}`).expect(401);
    });

    it("should response 401 if token is invalid", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      await request(app.getServer())
        .delete(`/api/article/${article.body.data.id}`)
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
    });

    it("should response 403 if user is not the author of the article", async () => {
      const article = await request(app.getServer())
        .post("/api/article")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(articleData);

      const userData = {
        username: "test3",
        email: "test3@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData);

      const { body } = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(201);

      await request(app.getServer())
        .delete(`/api/article/${article.body.data.id}`)
        .set("Authorization", `Bearer ${body.accessToken}`)
        .expect(403);
    });

    it("should response 422 if articleId is invalid", async () => {
      await request(app.getServer())
        .delete("/api/article/invalid_article_id")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(422);
    });

    it("should response 400 if article is not found", async () => {
      await request(app.getServer())
        .delete(`/api/article/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});
