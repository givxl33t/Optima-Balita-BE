import request from "supertest";
import App from "@/app";
import ConsultationRoute from "@/api/consultation/consultation.route";
import AuthRoute from "../auth/auth.route";
import { truncate, updateUserRole } from "@/utils/tests.utils";
import { ADMIN_ID as ADMIN } from "@/utils/constant.utils";
import { DOCTOR_ID as DOCTOR } from "@/utils/constant.utils";
import { v4 as uuidv4 } from "uuid";
import UserRoute from "../user/user.route";

describe("consultation endpoint", () => {
  let app;
  let consultationRoute;
  const userRoute = new UserRoute();
  const users = userRoute.userController.userService.users;
  const userRoles = userRoute.userController.userService.userRoles;
  let consultants;
  let accessToken;
  let doctorId;

  beforeAll(async () => {
    app = new App([new ConsultationRoute(), new AuthRoute()]);
    consultationRoute = new ConsultationRoute();
    consultants = consultationRoute.consultationController.consultationService.consultants;

    const adminData = {
      username: "admin",
      email: "admin@example.com",
      password: "F4k3P4ssw0rd!",
    };

    await request(app.getServer()).post("/api/auth/register").send(adminData);

    const adminUser = await users.findOne({ where: { email: adminData.email } });
    await updateUserRole(userRoles, adminUser?.id as string, ADMIN as string);

    const response = await request(app.getServer())
      .post("/api/auth/login")
      .send({ email: adminData.email, password: adminData.password });

    accessToken = response.body.accessToken;

    const doctorData = {
      username: "doctor",
      email: "doctor@gmail.com",
      password: "F4k3P4ssw0rd!",
    };

    await request(app.getServer()).post("/api/auth/register").send(doctorData);
    const doctorUser = await users.findOne({ where: { email: doctorData.email } });
    await updateUserRole(userRoles, doctorUser?.id as string, DOCTOR as string);

    doctorId = doctorUser?.id;
  });

  afterAll(async () => {
    await truncate({ users, consultants });
  });

  describe("when GET /api/consultation/consultant", () => {
    it("should response 200 and return all consultants", async () => {
      const response = await request(app.getServer())
        .get("/api/consultation/consultant")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });

    it("should response 401 when no token provided", async () => {
      const response = await request(app.getServer())
        .get("/api/consultation/consultant")
        .expect(401);

      expect(response.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 when invalid token provided", async () => {
      const response = await request(app.getServer())
        .get("/api/consultation/consultant")
        .set("Authorization", `Bearer ${uuidv4()}`)
        .expect(401);

      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });
  });

  describe("when GET /api/consultation/consultant/:consultantId", () => {
    it("should response 200 and return consultant", async () => {
      const consultantData = {
        consultant_description: "Consultant description",
        consultant_phone: "081313131333",
        consultant_id: doctorId,
      };
      const consultant = await consultants.create(consultantData);

      const response = await request(app.getServer())
        .get(`/api/consultation/consultant/${consultant.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: consultant.id,
        }),
      );
    });

    it("should response 401 when no token provided", async () => {
      const response = await request(app.getServer())
        .get(`/api/consultation/consultant/${uuidv4()}`)
        .expect(401);

      expect(response.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 when invalid token provided", async () => {
      const response = await request(app.getServer())
        .get(`/api/consultation/consultant/${uuidv4()}`)
        .set("Authorization", `Bearer ${uuidv4()}`)
        .expect(401);

      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 when user is not admin", async () => {
      const userData = {
        username: "user",
        email: "user2@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData);

      const userRes = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password });

      const userToken = userRes.body.accessToken;

      const response = await request(app.getServer())
        .get(`/api/consultation/consultant/${uuidv4()}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toEqual("You do not have permission to access this resource");
    });

    it("should response 422 if consultantId is not uuid", async () => {
      const response = await request(app.getServer())
        .get("/api/consultation/consultant/123")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(422);

      expect(response.body.message).toEqual("Invalid Consultant ID");
    });

    it("should response 400 if consultantId is not found", async () => {
      const response = await request(app.getServer())
        .get(`/api/consultation/consultant/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body.message).toEqual("Consultant not found");
    });
  });

  describe("when POST /api/consultation/consultant", () => {
    it("should response 201 and return consultant", async () => {
      const consultantData = {
        consultant_description: "Consultant description",
        consultant_phone: "081313131333",
        user_id: doctorId,
      };

      const response = await request(app.getServer())
        .post("/api/consultation/consultant")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(consultantData)
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: expect.any(String),
        }),
      );
    });

    it("should response 401 when no token provided", async () => {
      const response = await request(app.getServer())
        .post("/api/consultation/consultant")
        .expect(401);

      expect(response.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 when invalid token provided", async () => {
      const response = await request(app.getServer())
        .post("/api/consultation/consultant")
        .set("Authorization", `Bearer ${uuidv4()}`)
        .expect(401);

      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 when user is not admin", async () => {
      const userData = {
        username: "user",
        email: "user2@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData);

      const userRes = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password });

      const userToken = userRes.body.accessToken;

      const response = await request(app.getServer())
        .post("/api/consultation/consultant")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toEqual("You do not have permission to access this resource");
    });

    it("should response 422 if consultant data is invalid", async () => {
      const consultantData = {
        consultant_description: "Consultant description",
        consultant_phone: "081313131333",
        user_id: "123",
      };

      const response = await request(app.getServer())
        .post("/api/consultation/consultant")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(consultantData)
        .expect(422);

      expect(response.body.message).toEqual("Invalid User ID");
    });

    it("should response 404 if user is not found", async () => {
      const consultantData = {
        consultant_description: "Consultant description",
        consultant_phone: "081313131333",
        user_id: uuidv4(),
      };

      const response = await request(app.getServer())
        .post("/api/consultation/consultant")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(consultantData)
        .expect(404);

      expect(response.body.message).toEqual("User not found");
    });
  });

  describe("when PUT /api/consultation/consultant/:consultantId", () => {
    it("should response 200 and return updated consultant", async () => {
      const consultantData = {
        consultant_description: "Consultant description",
        consultant_phone: "081313131333",
        consultant_id: doctorId,
      };
      const consultant = await consultants.create(consultantData);

      const updatedConsultantData = {
        consultant_description: "Consultant description updated",
        consultant_phone: "081313131333",
      };

      const response = await request(app.getServer())
        .put(`/api/consultation/consultant/${consultant.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updatedConsultantData)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it("should response 401 when no token provided", async () => {
      const response = await request(app.getServer())
        .put(`/api/consultation/consultant/${uuidv4()}`)
        .expect(401);

      expect(response.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 when invalid token provided", async () => {
      const response = await request(app.getServer())
        .put(`/api/consultation/consultant/${uuidv4()}`)
        .set("Authorization", `Bearer ${uuidv4()}`)
        .expect(401);

      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 when user is not admin", async () => {
      const userData = {
        username: "user",
        email: "user3@gmail.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData);

      const userRes = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password });

      const userToken = userRes.body.accessToken;

      const response = await request(app.getServer())
        .put(`/api/consultation/consultant/${uuidv4()}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toEqual("You do not have permission to access this resource");
    });
  });

  describe("when DELETE /api/consultation/consultant/:consultantId", () => {
    it("should response 200 and return deleted consultant", async () => {
      const consultantData = {
        consultant_description: "Consultant description",
        consultant_phone: "081313131333",
        consultant_id: doctorId,
      };
      const consultant = await consultants.create(consultantData);

      const response = await request(app.getServer())
        .delete(`/api/consultation/consultant/${consultant.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.message).toEqual("Consultation successfully deleted");
    });

    it("should response 401 when no token provided", async () => {
      const response = await request(app.getServer())
        .delete(`/api/consultation/consultant/${uuidv4()}`)
        .expect(401);

      expect(response.body.message).toEqual("Authorization Header missing.");
    });

    it("should response 401 when invalid token provided", async () => {
      const response = await request(app.getServer())
        .delete(`/api/consultation/consultant/${uuidv4()}`)
        .set("Authorization", `Bearer ${uuidv4()}`)
        .expect(401);

      expect(response.body.message).toEqual("Invalid or Expired token. Please login again.");
    });

    it("should response 403 when user is not admin", async () => {
      const userData = {
        username: "user",
        email: "user6@example.com",
        password: "F4k3P4ssw0rd!",
      };

      await request(app.getServer()).post("/api/auth/register").send(userData);

      const userRes = await request(app.getServer())
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password });

      const userToken = userRes.body.accessToken;

      const response = await request(app.getServer())
        .delete(`/api/consultation/consultant/${uuidv4()}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toEqual("You do not have permission to access this resource");
    });

    it("should response 422 if consultantId is not uuid", async () => {
      const response = await request(app.getServer())
        .delete("/api/consultation/consultant/123")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(422);

      expect(response.body.message).toEqual("Invalid Consultant ID");
    });

    it("should response 400 if consultantId is not found", async () => {
      const response = await request(app.getServer())
        .delete(`/api/consultation/consultant/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body.message).toEqual("Consultant not found");
    });
  });
});
