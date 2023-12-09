import { Response } from "express";
import expressAsyncHandler from "express-async-handler";
import NutritionService from "@/services/nutrition.service";
import { AuthenticateRequest } from "@/interfaces/request.interface";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";

class NutritionController {
  public nutritionService = new NutritionService();

  public getUserNutritionHistories = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const userId = req.user?.user_id;
      const nutritionHistories = await this.nutritionService.getNutritionHistories();
      const userNutritionHistories = nutritionHistories.filter(
        (history) => history.creator_id === userId,
      );
      res
        .status(status.OK)
        .json(
          apiResponse(
            status.OK,
            "OK",
            "Current User Nutrition histories successfully found",
            userNutritionHistories,
          ),
        );
    },
  );

  public createNutritionHistory = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const userId = req.user?.user_id;
      const nutritionHistoryData = req.body;
      const createdNutritionHistory = await this.nutritionService.createNutritionHistory(
        nutritionHistoryData,
        userId,
      );
      res
        .status(status.CREATED)
        .json(
          apiResponse(
            status.CREATED,
            "CREATED",
            "Nutrition history successfully created",
            createdNutritionHistory,
          ),
        );
    },
  );
}

export default NutritionController;
