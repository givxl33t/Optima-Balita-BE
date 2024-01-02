import { Router } from "express";
import NutritionController from "./nutrition.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import { CreateNutritionHistoryDto, GetChildrenQueryDto } from "@/dtos/nutrition.dto";
import { RouteInterface } from "@/interfaces/routes.interface";
import { authenticate } from "@/middlewares/authentication.middleware";
import { authorize } from "@/middlewares/authorization.middleware";
import { ADMIN_ID as ADMIN, DOCTOR_ID as DOCTOR } from "@/utils/constant.utils";

class NutritionRoute implements RouteInterface {
  public path = "/bmi";
  public router = Router();
  public nutritionController = new NutritionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/children`,
      authenticate,
      authorize([ADMIN, DOCTOR]),
      validationMiddleware(GetChildrenQueryDto, "query"),
      this.nutritionController.getChildrens,
    );
    this.router.get(
      `${this.path}/children/:childId`,
      authenticate,
      authorize([ADMIN, DOCTOR]),
      this.nutritionController.getChildren,
    );
    this.router.get(
      `${this.path}/me`,
      authenticate,
      this.nutritionController.getUserNutritionHistories,
    );
    this.router.post(
      `${this.path}`,
      authenticate,
      validationMiddleware(CreateNutritionHistoryDto, "body"),
      this.nutritionController.createNutritionHistory,
    );
  }
}

export default NutritionRoute;
