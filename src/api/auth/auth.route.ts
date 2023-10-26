import { Router } from "express";
import AuthController from "@/api/auth/auth.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import { RouteInterface } from "@/interfaces/routes.interface";
import { RegisterUserDto, LoginUserDto, TokenManageDto } from "@/dtos/auth.dto";

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

    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LoginUserDto, "body"),
      this.authController.login,
    );

    this.router.put(
      `${this.path}/refresh`,
      validationMiddleware(TokenManageDto, "body"),
      this.authController.refresh,
    );

    this.router.delete(
      `${this.path}/logout`,
      validationMiddleware(TokenManageDto, "body"),
      this.authController.logout,
    );
  }
}

export default AuthRoute;
