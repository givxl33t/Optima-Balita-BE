import DB from "@/config/database";
import { CreateNutritionHistoryDto } from "@/dtos/nutrition.dto";
import { NutritionHistoryInterface } from "@/interfaces/nutrition.interface";

class NutritionService {
  public nutritionHistories = DB.NutritionHistoryModel;

  public getNutritionHistories = async (): Promise<NutritionHistoryInterface[]> => {
    const nutritionHistories = await this.nutritionHistories.findAll({
      attributes: [
        "id",
        "child_name",
        "age_text",
        "height",
        "weight",
        "bmi",
        "weight_category",
        "gender",
        "creator_id",
        "created_at",
      ],
    });

    return nutritionHistories;
  };

  public createNutritionHistory = async (
    nutritionHistoryData: CreateNutritionHistoryDto,
    creatorId: string,
  ): Promise<NutritionHistoryInterface> => {
    const nutritionHistory = await this.nutritionHistories.create({
      ...nutritionHistoryData,
      creator_id: creatorId,
    });
    return nutritionHistory;
  };
}

export default NutritionService;
