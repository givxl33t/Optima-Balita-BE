import { MetaInterface } from "./pagination.interface";
import { UserModel } from "@/api/auth/user.model";

export interface NutritionHistoryInterface {
  id: string;
  child_id: string;
  child_name?: string;
  gender?: string;
  age_text: string;
  height: number;
  weight: number;
  bmi: number;
  height_category: string;
  mass_category: string;
  weight_category: string;
  age_in_month?: number;
  creator_id?: string;
  creator?: UserModel;
  created_at: Date;
}

export interface MappedChildrenInterface {
  latest_age: string;
  latest_height: number;
  latest_weight: number;
  latest_bmi: number;
  latest_height_category: string;
  latest_mass_category: string;
  latest_weight_category: string;
  creator_username: string;
  creator_profile: string;
  created_at: Date;
}

export interface MappedChildInterface {
  id: string;
  child_name: string;
  gender: string;
  latest_age: string;
  latest_height: number;
  latest_weight: number;
  latest_bmi: number;
  latest_height_category: string;
  latest_mass_category: string;
  latest_weight_category: string;
  nutrition_histories: NutritionHistoryInterface[];
  creator_id?: string;
  creator_username: string;
  creator_profile: string;
  created_at: Date;
}

export interface PaginatedChildrenInterface {
  meta: MetaInterface;
  rows: MappedChildrenInterface[];
}
