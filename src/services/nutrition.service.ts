import DB from "@/config/database";
import {
  CreateNutritionHistoryDto,
  UpdateNutritionHistoryDto,
  UpdateChildrenDto,
} from "@/dtos/nutrition.dto";
import {
  NutritionHistoryInterface,
  MappedChildrenInterface,
  MappedChildInterface,
  PaginatedChildrenInterface,
  PaginatedNutritionHistoriesInterface,
} from "@/interfaces/nutrition.interface";
import sequelize from "sequelize";
import { metaBuilder } from "@/utils/pagination.utils";
import { HttpExceptionBadRequest } from "@/exceptions/HttpException";
import BoysLengthZScoreDataset from "@/utils/dataset/boysLengthZScoreDataset.utils";
import GirlsLengthZScoreDataset from "@/utils/dataset/girlsLengthZScoreDataset.utils";
import BoysWeightZScoreDataset from "@/utils/dataset/boysWeightZScoreDataset.utils";
import GirlsWeightZScoreDataset from "@/utils/dataset/girlsWeightZScoreDataset.utils";
import BoysBMIZscoreDataset from "@/utils/dataset/boysBMIZscoreDataset.utils";
import GirlsBMIZscoreDataset from "@/utils/dataset/girlsBMIZscoreDataset.utils";

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
          "height_category",
          "mass_category",
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

      const mappedRows = this.mappedChildrens(nutritionHistories);

      // Manual pagination
      const startIndex = offset;
      const endIndex = offset + limit;
      const paginatedRows = mappedRows.slice(startIndex, endIndex);

      meta = metaBuilder(offset, limit, mappedRows.length);
      return { rows: paginatedRows, meta };
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
          "height_category",
          "mass_category",
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
        "height_category",
        "mass_category",
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

    if (children.length === 0) {
      throw new HttpExceptionBadRequest("Children not found");
    }

    return this.mappedChildren(children);
  };

  public updateChildren = async (childId: string, childData: UpdateChildrenDto): Promise<void> => {
    const existingChildren = await this.nutritionHistories.findAll({
      where: { child_id: childId },
    });
    if (existingChildren.length === 0) {
      throw new HttpExceptionBadRequest("Children not found");
    }

    const newChildId = `${existingChildren[0].creator_id}-${childData.child_name.replace(
      /\s/g,
      "",
    )}-${childData.gender === "Laki-laki" ? "L" : "P"}`;

    await this.nutritionHistories.update(
      {
        ...childData,
        child_id: newChildId,
      },
      {
        where: { child_id: childId },
      },
    );
  };

  public deleteChildren = async (childId: string): Promise<void> => {
    const existingChildren = await this.nutritionHistories.findAll({
      where: { child_id: childId },
    });
    if (existingChildren.length === 0) {
      throw new HttpExceptionBadRequest("Children not found");
    }

    await this.nutritionHistories.destroy({ where: { child_id: childId } });
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
        "height_category",
        "mass_category",
        "weight_category",
        "gender",
        "creator_id",
        "created_at",
      ],
      where: { creator_id: userId },
    });

    return nutritionHistories;
  };

  public getNutritionHistories = async (
    offset: number,
    limit: number,
    filter?: string,
  ): Promise<PaginatedNutritionHistoriesInterface> => {
    let meta;
    let nutritionHistories;

    const whereClause = {};

    if (filter) {
      whereClause[sequelize.Op.or] = [
        {
          height_category: {
            [sequelize.Op.iLike]: `%${filter}%`,
          },
        },
        {
          weight_category: {
            [sequelize.Op.iLike]: `%${filter}%`,
          },
        },
        {
          mass_category: {
            [sequelize.Op.iLike]: `%${filter}%`,
          },
        },
      ];
    }

    if (!isNaN(offset) && !isNaN(limit)) {
      nutritionHistories = await this.nutritionHistories.findAndCountAll({
        attributes: [
          "id",
          "child_id",
          "child_name",
          "age_text",
          "height",
          "weight",
          "gender",
          "bmi",
          "height_category",
          "mass_category",
          "weight_category",
          "creator_id",
          "created_at",
        ],
        where: whereClause,
        offset,
        limit,
        order: [["created_at", "DESC"]],
      });

      const { rows, count } = nutritionHistories;
      meta = metaBuilder(offset, limit, count);
      return { rows, meta };
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
          "height_category",
          "mass_category",
          "weight_category",
          "creator_id",
          "created_at",
        ],
        where: whereClause,
        order: [["created_at", "DESC"]],
      });

      return { rows: nutritionHistories, meta };
    }
  };

  public getNutritionHistory = async (
    nutritionHistoryId: string,
  ): Promise<NutritionHistoryInterface> => {
    const nutritionHistory = await this.nutritionHistories.findByPk(nutritionHistoryId);
    if (!nutritionHistory) throw new HttpExceptionBadRequest("Nutrition History not found");

    const ageInMonth = this.convertAgeToMonth(nutritionHistory.age_text);

    return {
      ...nutritionHistory.toJSON(),
      age_in_month: ageInMonth,
    };
  };

  public createNutritionHistory = async (
    nutritionHistoryData: CreateNutritionHistoryDto,
    creatorId: string,
  ): Promise<NutritionHistoryInterface> => {
    let bmi = 0;
    let heightCategory = "No Data";
    let weightCategory = "No Data";
    let bmiCategory = "No Data";

    const childId = `${creatorId}-${nutritionHistoryData.child_name.replace(/\s/g, "")}-${
      nutritionHistoryData.gender === "Laki-laki" ? "L" : "P"
    }`;

    const ageInMonth = this.convertAgeToMonth(nutritionHistoryData.age_text);

    if (ageInMonth >= 0 && ageInMonth <= 60) {
      bmi = nutritionHistoryData.weight / Math.pow(nutritionHistoryData.height / 100, 2);

      heightCategory = this.lengthCategoryDecider(
        nutritionHistoryData.height,
        nutritionHistoryData.gender,
        ageInMonth,
      );
      weightCategory = this.weightCategoryDecider(
        nutritionHistoryData.weight,
        nutritionHistoryData.gender,
        ageInMonth,
      );
      bmiCategory = this.bmiCategoryDecider(bmi, nutritionHistoryData.gender, ageInMonth);
    }

    const nutritionHistory = await this.nutritionHistories.create({
      ...nutritionHistoryData,
      child_id: childId,
      creator_id: creatorId,
      bmi: bmi.toFixed(2),
      height_category: heightCategory,
      mass_category: weightCategory,
      weight_category: bmiCategory,
    });
    return nutritionHistory;
  };

  public updateNutritionHistory = async (
    nutritionHistoryId: string,
    nutritionHistoryData: UpdateNutritionHistoryDto,
  ): Promise<void> => {
    let bmi = 0;
    let heightCategory = "No Data";
    let weightCategory = "No Data";
    let bmiCategory = "No Data";

    const existingNutritionHistory = await this.nutritionHistories.findByPk(nutritionHistoryId);
    if (!existingNutritionHistory) throw new HttpExceptionBadRequest("Nutrition History not found");

    const years = Math.floor(nutritionHistoryData.age_in_month / 12);
    const remainingMonths = nutritionHistoryData.age_in_month % 12;
    const ageText =
      years > 0 ? `${years} tahun ${remainingMonths} bulan` : `${remainingMonths} bulan`;

    if (nutritionHistoryData.age_in_month >= 0 && nutritionHistoryData.age_in_month <= 60) {
      bmi = nutritionHistoryData.weight / Math.pow(nutritionHistoryData.height / 100, 2);

      heightCategory = this.lengthCategoryDecider(
        nutritionHistoryData.height,
        existingNutritionHistory.gender,
        Number(nutritionHistoryData.age_in_month),
      );
      weightCategory = this.weightCategoryDecider(
        nutritionHistoryData.weight,
        existingNutritionHistory.gender,
        Number(nutritionHistoryData.age_in_month),
      );
      bmiCategory = this.bmiCategoryDecider(
        bmi,
        existingNutritionHistory.gender,
        Number(nutritionHistoryData.age_in_month),
      );
    }

    await this.nutritionHistories.update(
      {
        ...nutritionHistoryData,
        bmi: bmi.toFixed(2),
        height_category: heightCategory,
        mass_category: weightCategory,
        weight_category: bmiCategory,
        age_text: ageText,
      },
      {
        where: { id: nutritionHistoryId },
      },
    );
  };

  public deleteNutritionHistory = async (nutritionHistoryId: string): Promise<void> => {
    const existingNutritionHistory = await this.nutritionHistories.findByPk(nutritionHistoryId);
    if (!existingNutritionHistory) throw new HttpExceptionBadRequest("Nutrition History not found");

    await this.nutritionHistories.destroy({ where: { id: nutritionHistoryId } });
  };

  private weightCategoryDecider = (weight: number, gender: string, ageInMonth: number): string => {
    const dataset = gender === "Laki-laki" ? BoysWeightZScoreDataset : GirlsWeightZScoreDataset;
    const weightStandards = dataset.find((data) => data.Month === ageInMonth);

    if (weightStandards) {
      const { SD3neg, SD2neg, SD1neg, SD0, SD1, SD2, SD3 } = weightStandards;

      if (weight <= SD3neg) {
        return "Severely Wasted";
      } else if (weight > SD3neg && weight <= SD2neg) {
        return "Wasted";
      } else if (weight > SD2neg && weight <= SD1neg) {
        return "Normal";
      } else if (weight > SD1neg && weight <= SD0) {
        return "Normal";
      } else if (weight > SD0 && weight <= SD1) {
        return "Normal";
      } else if (weight > SD1 && weight <= SD2) {
        return "Overweight";
      } else if (weight > SD2 && weight <= SD3) {
        return "Overweight";
      } else {
        return "Obese";
      }
    }

    return "No Data";
  };

  private lengthCategoryDecider = (length: number, gender: string, ageInMonth: number): string => {
    const dataset = gender === "Laki-laki" ? BoysLengthZScoreDataset : GirlsLengthZScoreDataset;
    const lengthStandards = dataset.find((data) => data.Month === ageInMonth);

    if (lengthStandards) {
      const { SD3neg, SD2neg, SD1neg, SD0, SD1, SD2, SD3 } = lengthStandards;

      if (length <= SD3neg) {
        return "Severely Stunted";
      } else if (length > SD3neg && length <= SD2neg) {
        return "Stunted";
      } else if (length > SD2neg && length <= SD1neg) {
        return "Normal";
      } else if (length > SD1neg && length <= SD0) {
        return "Normal";
      } else if (length > SD0 && length <= SD1) {
        return "Normal";
      } else if (length > SD1 && length <= SD2) {
        return "Normal";
      } else if (length > SD2 && length <= SD3) {
        return "Normal";
      } else {
        return "Tall";
      }
    }

    return "No Data";
  };

  private bmiCategoryDecider = (bmi: number, gender: string, ageInMonth: number): string => {
    const dataset = gender === "Laki-laki" ? BoysBMIZscoreDataset : GirlsBMIZscoreDataset;
    const bmiStandards = dataset.find((data) => data.Month === ageInMonth);

    if (bmiStandards) {
      const { SD3neg, SD2neg, SD1neg, SD0, SD1, SD2, SD3 } = bmiStandards;

      if (bmi <= SD3neg) {
        return "Severely Wasted";
      } else if (bmi > SD3neg && bmi <= SD2neg) {
        return "Wasted";
      } else if (bmi > SD2neg && bmi <= SD1neg) {
        return "Normal";
      } else if (bmi > SD1neg && bmi <= SD0) {
        return "Normal";
      } else if (bmi > SD0 && bmi <= SD1) {
        return "Normal";
      } else if (bmi > SD1 && bmi <= SD2) {
        return "Overweight";
      } else if (bmi > SD2 && bmi <= SD3) {
        return "Overweight";
      } else {
        return "Obese";
      }
    }

    return "No Data";
  };

  private convertAgeToMonth = (ageText: string): number => {
    let ageInMonths;

    const matchWithYears = ageText.match(/(\d+)\s*tahun\s*(\d*)\s*bulan/);
    const matchWithoutYears = ageText.match(/(\d+)\s*bulan/);

    if (matchWithYears) {
      const years = parseInt(matchWithYears[1], 10);
      const months = parseInt(matchWithYears[2], 10);
      ageInMonths = years * 12 + months;
    } else if (matchWithoutYears) {
      const months = parseInt(matchWithoutYears[1], 10);
      ageInMonths = months;
    }

    return ageInMonths;
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
        height_category: nutritionHistory.height_category,
        mass_category: nutritionHistory.mass_category,
        weight_category: nutritionHistory.weight_category,
        created_at: nutritionHistory.created_at,
      };
    });

    mappedNutritionHistories.sort((a, b) => {
      if (this.convertAgeToMonth(a.age_text) < this.convertAgeToMonth(b.age_text)) {
        return -1;
      } else if (this.convertAgeToMonth(a.age_text) > this.convertAgeToMonth(b.age_text)) {
        return 1;
      } else {
        return 0;
      }
    });

    const latestNutritionHistory = mappedNutritionHistories.reduce((r, a) => {
      if (this.convertAgeToMonth(a.age_text) > this.convertAgeToMonth(r.age_text)) {
        return a;
      } else {
        return r;
      }
    });

    const mappedChild = {
      id: nutritionHistories[0].child_id,
      child_name: nutritionHistories[0].child_name as string,
      gender: nutritionHistories[0].gender as string,
      latest_age: latestNutritionHistory.age_text,
      latest_height: latestNutritionHistory.height,
      latest_weight: latestNutritionHistory.weight,
      latest_bmi: latestNutritionHistory.bmi,
      latest_height_category: latestNutritionHistory.height_category,
      latest_mass_category: latestNutritionHistory.mass_category,
      latest_weight_category: latestNutritionHistory.weight_category,
      nutrition_histories: mappedNutritionHistories,
      creator_id: nutritionHistories[0].creator_id,
      creator_username: nutritionHistories[0].creator?.username as string,
      creator_profile: nutritionHistories[0].creator?.profile as string,
      created_at: latestNutritionHistory.created_at,
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
        if (this.convertAgeToMonth(a.age_text) > this.convertAgeToMonth(r.age_text)) {
          return a;
        } else {
          return r;
        }
      });

      return {
        id: latestNutritionHistory.child_id,
        child_name: latestNutritionHistory.child_name,
        gender: latestNutritionHistory.gender,
        latest_age: latestNutritionHistory.age_text,
        latest_height: latestNutritionHistory.height,
        latest_weight: latestNutritionHistory.weight,
        latest_bmi: latestNutritionHistory.bmi,
        latest_height_category: latestNutritionHistory.height_category,
        latest_mass_category: latestNutritionHistory.mass_category,
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
