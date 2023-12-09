import { Router } from "express";
import NutritionController from "./nutrition.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import { CreateNutritionHistoryDto } from "@/dtos/nutrition.dto";
import { RouteInterface } from "@/interfaces/routes.interface";
import { authenticate } from "@/middlewares/authentication.middleware";

class NutritionRoute implements RouteInterface {
  public path = "/bmi";
  public router = Router();
  public nutritionController = new NutritionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
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
