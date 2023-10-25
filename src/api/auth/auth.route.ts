import { Router } from "express";
import AuthController from "@/api/auth/auth.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import { RouteInterface } from "@/interfaces/routes.interface";
import { RegisterUserDto } from "@/dtos/auth.dto";

class AuthRoute implements RouteInterface {
  public path = "/auth";
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(RegisterUserDto, "body"),
      this.authController.register,
    );
  }
}

export default AuthRoute;
