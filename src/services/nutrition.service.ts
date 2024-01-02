import DB from "@/config/database";
import { CreateNutritionHistoryDto } from "@/dtos/nutrition.dto";
import {
  NutritionHistoryInterface,
  MappedChildrenInterface,
  MappedChildInterface,
  PaginatedChildrenInterface,
} from "@/interfaces/nutrition.interface";
import sequelize from "sequelize";
import { metaBuilder } from "@/utils/pagination.utils";

class NutritionService {
  public nutritionHistories = DB.NutritionHistoryModel;
  public users = DB.UserModel;

  public getChildrens = async (
    offset: number,
    limit: number,
    filter?: string,
  ): Promise<PaginatedChildrenInterface> => {
    let meta;
    let nutritionHistories;
    const whereClause = filter ? { child_name: { [sequelize.Op.iLike]: `%${filter}%` } } : {};

    if (!isNaN(offset) && !isNaN(limit)) {
      nutritionHistories = await this.nutritionHistories.findAll({
        attributes: [
          "id",
          "child_id",
          "child_name",
          "age_text",
          "height",
          "weight",
          "gender",
          "bmi",
          "weight_category",
          "creator_id",
          "created_at",
        ],
        include: [
          {
            model: this.users,
            as: "creator",
            attributes: ["id", "username", "profile"],
          },
        ],
        where: whereClause,
        order: [["created_at", "DESC"]],
        offset,
        limit,
      });

      const mappedRows = this.mappedChildrens(nutritionHistories);
      meta = metaBuilder(offset, limit, mappedRows.length);
      return { rows: mappedRows, meta };
    } else {
      nutritionHistories = await this.nutritionHistories.findAll({
        attributes: [
          "id",
          "child_id",
          "child_name",
          "age_text",
          "height",
          "weight",
          "gender",
          "bmi",
          "weight_category",
          "creator_id",
          "created_at",
        ],
        include: [
          {
            model: this.users,
            as: "creator",
            attributes: ["id", "username", "profile"],
          },
        ],
        where: whereClause,
        order: [["created_at", "DESC"]],
      });

      return { rows: this.mappedChildrens(nutritionHistories), meta };
    }
  };

  public getChildren = async (childId: string): Promise<MappedChildrenInterface> => {
    const children = await this.nutritionHistories.findAll({
      attributes: [
        "id",
        "child_id",
        "child_name",
        "age_text",
        "height",
        "weight",
        "gender",
        "bmi",
        "weight_category",
        "creator_id",
        "created_at",
      ],
      include: [
        {
          model: this.users,
          as: "creator",
          attributes: ["id", "username", "profile"],
        },
      ],
      where: { child_id: childId },
      order: [["created_at", "DESC"]],
    });

    return this.mappedChildren(children);
  };

  public getUserNutritionHistories = async (userId): Promise<NutritionHistoryInterface[]> => {
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
      where: { creator_id: userId },
    });

    return nutritionHistories;
  };

  public createNutritionHistory = async (
    nutritionHistoryData: CreateNutritionHistoryDto,
    creatorId: string,
  ): Promise<NutritionHistoryInterface> => {
    const childId = `${creatorId}-${nutritionHistoryData.child_name.replace(/\s/g, "")}-${
      nutritionHistoryData.gender === "Laki-laki" ? "L" : "P"
    }`;

    const nutritionHistory = await this.nutritionHistories.create({
      ...nutritionHistoryData,
      child_id: childId,
      creator_id: creatorId,
    });
    return nutritionHistory;
  };

  public mappedChildren = (
    nutritionHistories: NutritionHistoryInterface[],
  ): MappedChildInterface => {
    const mappedNutritionHistories = nutritionHistories.map((nutritionHistory) => {
      return {
        id: nutritionHistory.id,
        child_id: nutritionHistory.child_id,
        age_text: nutritionHistory.age_text,
        height: nutritionHistory.height,
        weight: nutritionHistory.weight,
        bmi: nutritionHistory.bmi,
        weight_category: nutritionHistory.weight_category,
        created_at: nutritionHistory.created_at,
      };
    });

    const mappedChild = {
      id: nutritionHistories[0].child_id,
      child_name: nutritionHistories[0].child_name as string,
      gender: nutritionHistories[0].gender as string,
      latest_age: mappedNutritionHistories[0].age_text,
      latest_height: mappedNutritionHistories[0].height,
      latest_weight: mappedNutritionHistories[0].weight,
      latest_bmi: mappedNutritionHistories[0].bmi,
      latest_weight_category: mappedNutritionHistories[0].weight_category,
      nutrition_histories: mappedNutritionHistories,
      creator_id: nutritionHistories[0].creator_id,
      creator_username: nutritionHistories[0].creator?.username as string,
      creator_profile: nutritionHistories[0].creator?.profile as string,
      created_at: mappedNutritionHistories[0].created_at,
    };

    return mappedChild;
  };

  public mappedChildrens = (
    nutritionHistories: NutritionHistoryInterface[],
  ): MappedChildrenInterface[] => {
    const groupedNutritionHistories = nutritionHistories.reduce((r, a) => {
      r[a.child_id as string] = [...(r[a.child_id as string] || []), a];
      return r;
    }, {});

    const mappedNutritionHistories = Object.keys(groupedNutritionHistories).map((key) => {
      const nutritionHistory = groupedNutritionHistories[key];
      const latestNutritionHistory = nutritionHistory.reduce((r, a) => {
        return r.created_at > a.created_at ? r : a;
      });

      return {
        id: latestNutritionHistory.child_id,
        child_name: latestNutritionHistory.child_name,
        gender: latestNutritionHistory.gender,
        latest_age: latestNutritionHistory.age_text,
        latest_height: latestNutritionHistory.height,
        latest_weight: latestNutritionHistory.weight,
        latest_bmi: latestNutritionHistory.bmi,
        latest_weight_category: latestNutritionHistory.weight_category,
        creator_username: latestNutritionHistory.creator.username,
        creator_profile: latestNutritionHistory.creator.profile,
        created_at: latestNutritionHistory.created_at,
      };
    });

    return mappedNutritionHistories;
  };
}

export default NutritionService;
