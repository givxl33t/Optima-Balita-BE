import { Router } from "express";
import UserController from "./user.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import { GetUserQueryDto, UpdateUserDto, UserIdParamDto } from "@/dtos/user.dto";
import { RouteInterface } from "@/interfaces/routes.interface";
import { authenticate } from "@/middlewares/authentication.middleware";
import { authorize } from "@/middlewares/authorization.middleware";
import { ADMIN_ID as ADMIN } from "@/utils/constant.utils";

class UserRoute implements RouteInterface {
  public path = "/user";
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      authenticate,
      authorize([ADMIN]),
      validationMiddleware(GetUserQueryDto, "query"),
      this.userController.getUsers,
    );
    this.router.get(
      `${this.path}/:userId`,
      authenticate,
      authorize([ADMIN]),
      validationMiddleware(UserIdParamDto, "params"),
      this.userController.getUser,
    );
    this.router.put(
      `${this.path}/:userId`,
      authenticate,
      authorize([ADMIN]),
      validationMiddleware(UserIdParamDto, "params"),
      validationMiddleware(UpdateUserDto, "body"),
      this.userController.updateUser,
    );
    this.router.delete(
      `${this.path}/:userId`,
      authenticate,
      authorize([ADMIN]),
      validationMiddleware(UserIdParamDto, "params"),
      this.userController.deleteUser,
    );
  }
}

export default UserRoute;
