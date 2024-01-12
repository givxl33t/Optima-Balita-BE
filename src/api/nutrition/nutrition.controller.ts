import { Response } from "express";
import expressAsyncHandler from "express-async-handler";
import NutritionService from "@/services/nutrition.service";
import { AuthenticateRequest } from "@/interfaces/request.interface";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";

class NutritionController {
  public nutritionService = new NutritionService();

  public getChildrens = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { limit, page, filter } = req.query;
      const offset: number = (Number(page) - 1) * Number(limit);
      const { rows, meta } = await this.nutritionService.getChildrens(
        offset,
        Number(limit),
        filter as string,
      );
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Childrens successfully found", rows, meta));
    },
  );

  public getChildren = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const childId = req.params.childId;
      const children = await this.nutritionService.getChildren(childId);
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Children successfully found", children));
    },
  );

  public updateChildren = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const childId = req.params.childId;
      const childrenData = req.body;
      await this.nutritionService.updateChildren(childId, childrenData);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Children successfully updated"));
    },
  );

  public deleteChildren = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const childId = req.params.childId;
      await this.nutritionService.deleteChildren(childId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Children successfully deleted"));
    },
  );

  public getUserNutritionHistories = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const userId = req.user?.user_id;
      const nutritionHistories = await this.nutritionService.getUserNutritionHistories(userId);
      res
        .status(status.OK)
        .json(
          apiResponse(
            status.OK,
            "OK",
            "Current User Nutrition histories successfully found",
            nutritionHistories,
          ),
        );
    },
  );

  public getNutritionHistory = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { nutritionHistoryId } = req.params;
      const nutritionHistory = await this.nutritionService.getNutritionHistory(nutritionHistoryId);
      res
        .status(status.OK)
        .json(
          apiResponse(status.OK, "OK", "Nutrition history successfully found", nutritionHistory),
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

  public updateNutritionHistory = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { nutritionHistoryId } = req.params;
      const nutritionHistoryData = req.body;
      console.log("controller nutritionHistoryData", nutritionHistoryData);
      await this.nutritionService.updateNutritionHistory(nutritionHistoryId, nutritionHistoryData);
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Nutrition history successfully updated"));
    },
  );

  public deleteNutritionHistory = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { nutritionHistoryId } = req.params;
      await this.nutritionService.deleteNutritionHistory(nutritionHistoryId);
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Nutrition history successfully deleted"));
    },
  );
}

export default NutritionController;
