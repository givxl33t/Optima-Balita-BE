import request from "supertest";
import App from "@/app";
import { CreateDiscussionDto, CreateCommentDto } from "@/dtos/forum.dto";
import ForumRoute from "../forum/forum.route";
import AuthRoute from "../auth/auth.route";
import { truncate } from "@/utils/tests.utils";
import { v4 as uuidv4 } from "uuid";

describe("forum endpoint", () => {
  let app;
  let forumRoute;
  let discussions;
  let comments;
  let userDiscussionLikes;
  let accessToken;

  beforeAll(async () => {
    app = new App([new ForumRoute(), new AuthRoute()]);
    forumRoute = new ForumRoute();
    discussions = forumRoute.forumController.forumService.discussions;
    comments = forumRoute.forumController.forumService.comments;
    userDiscussionLikes = forumRoute.forumController.forumService.userDiscussionLikes;

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
    await truncate({ discussions, comments, userDiscussionLikes });
  });

  describe("when GET /api/forum", () => {
    const discussionData: CreateDiscussionDto = {
      title: "Discussion 1",
      post_content: "Discussion 1 content",
    };

    beforeEach(async () => {
      await request(app.getServer())
        .post("/api/forum")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(discussionData);
    });

    it("should response 200 and returned all discussions", async () => {
      const res = await request(app.getServer())
        .get("/api/forum")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveLength(1);
    });

    it("should response 200 and returned all discussions with comments", async () => {
      const res = await request(app.getServer())
        .get("/api/forum?option=WITHCOMMENT")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].comments).toBeDefined();
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).get("/api/forum").expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/forum")
        .set("Authorization", "Bearer invalid_token");
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if option is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/forum?option=INVALIDOPTION")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.message).toEqual("option must be one of the following values: WITHCOMMENT");
    });
  });

  describe("when GET /api/forum/:discussionId", () => {
    let discussionId;

    const discussionData: CreateDiscussionDto = {
      title: "Discussion 1",
      post_content: "Discussion 1 content",
    };

    beforeEach(async () => {
      const res = await request(app.getServer())
        .post("/api/forum")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(discussionData);
      discussionId = res.body.data.id;
    });

    it("should response 200 and returned discussion with comments", async () => {
      const res = await request(app.getServer())
        .get(`/api/forum/${discussionId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.comments).toBeDefined();
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer()).get(`/api/forum/${discussionId}`).expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .get(`/api/forum/${discussionId}`)
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if discussionId is invalid", async () => {
      const res = await request(app.getServer())
        .get("/api/forum/invalid_discussion_id")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.message).toEqual("Invalid Discussion ID");
    });

    it("should response 400 if discussion is not found", async () => {
      const res = await request(app.getServer())
        .get(`/api/forum/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(res.body.message).toEqual("Discussion not found.");
    });
  });

  describe("when POST /api/forum", () => {
    const discussionData: CreateDiscussionDto = {
      title: "Discussion 1",
      post_content: "Discussion 1 content",
    };

    it("should response 201 and created a discussion", async () => {
      const res = await request(app.getServer())
        .post("/api/forum")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(discussionData)
        .expect(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toEqual(discussionData.title);
      expect(res.body.data.post_content).toEqual(discussionData.post_content);
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/forum")
        .send(discussionData)
        .expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .post("/api/forum")
        .set("Authorization", "Bearer invalid_token")
        .send(discussionData)
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if title is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/forum")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "", post_content: discussionData.post_content })
        .expect(422);
      expect(res.body.message).toEqual("Title Required");
    });

    it("should response 422 if post_content is not provided", async () => {
      const res = await request(app.getServer())
        .post("/api/forum")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: discussionData.title })
        .expect(422);
      expect(res.body.message).toEqual("Content Required");
    });
  });

  describe("when POST /api/forum/:discussionId/comment", () => {
    let discussionId;

    const discussionData: CreateDiscussionDto = {
      title: "Discussion 1",
      post_content: "Discussion 1 content",
    };

    const commentData: CreateCommentDto = {
      comment_content: "Comment 1 content",
    };

    beforeAll(async () => {
      const res = await request(app.getServer())
        .post("/api/forum")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(discussionData);
      discussionId = res.body.data.id;
    });

    it("should response 201 and created a comment", async () => {
      comments.create = jest.fn().mockReturnValue({
        id: uuidv4(),
        comment_content: commentData.comment_content,
        commenter_id: uuidv4(),
        discussion_id: discussionId,
        created_at: new Date(),
      });

      const res = await request(app.getServer())
        .post(`/api/forum/${discussionId}/comment`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(commentData)
        .expect(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.comment_content).toEqual(commentData.comment_content);
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer())
        .post(`/api/forum/${discussionId}/comment`)
        .send(commentData)
        .expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .post(`/api/forum/${discussionId}/comment`)
        .set("Authorization", "Bearer invalid_token")
        .send(commentData)
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if discussionId is invalid", async () => {
      const res = await request(app.getServer())
        .post("/api/forum/invalid_discussion_id/comment")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(commentData)
        .expect(422);
      expect(res.body.message).toEqual("Invalid Discussion ID");
    });

    it("should response 400 if discussion is not found", async () => {
      const res = await request(app.getServer())
        .post(`/api/forum/${uuidv4()}/comment`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(commentData)
        .expect(400);
      expect(res.body.message).toEqual("Discussion not found.");
    });

    it("should response 422 if comment_content is not provided", async () => {
      const res = await request(app.getServer())
        .post(`/api/forum/${discussionId}/comment`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ comment_content: "" })
        .expect(422);
      expect(res.body.message).toEqual("Content Required");
    });
  });

  describe("when POST /api/forum/:discussionId/like", () => {
    let discussionId;

    const discussionData: CreateDiscussionDto = {
      title: "Discussion 1",
      post_content: "Discussion 1 content",
    };

    beforeEach(async () => {
      const res = await request(app.getServer())
        .post("/api/forum")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(discussionData);
      discussionId = res.body.data.id;
    });

    it("should response 200 when liked and unliked a discussion", async () => {
      await request(app.getServer())
        .post(`/api/forum/${discussionId}/like`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const res = await request(app.getServer())
        .post(`/api/forum/${discussionId}/like`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.message).toEqual("Discussion successfully unliked");
    });

    it("should response 401 if token is not provided", async () => {
      const res = await request(app.getServer())
        .post(`/api/forum/${discussionId}/like`)
        .expect(401);
      expect(res.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 if token is invalid", async () => {
      const res = await request(app.getServer())
        .post(`/api/forum/${discussionId}/like`)
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 422 if discussionId is invalid", async () => {
      const res = await request(app.getServer())
        .post("/api/forum/invalid_discussion_id/like")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.message).toEqual("Invalid Discussion ID");
    });

    it("should response 400 if discussion is not found", async () => {
      const res = await request(app.getServer())
        .post(`/api/forum/${uuidv4()}/like`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(res.body.message).toEqual("Discussion not found.");
    });
  });
});
