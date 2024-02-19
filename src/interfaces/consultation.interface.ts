import { UserModel } from "@/api/auth/user.model";
import { MetaInterface } from "./pagination.interface";

export interface ConsultantInterface {
  id: string;
  consultant_description: string;
  consultant_phone: string;
  consultant_id: string;
  consultant: UserModel;
  created_at: Date;
}

export interface MappedConsultantInterface {
  id: string;
  consultant_description: string;
  consultant_phone: string;
  consultant_id: string;
  consultant_username: string;
  consultant_profile: string;
  created_at: Date;
}

export interface PaginatedConsultantInterface {
  meta: MetaInterface | undefined;
  rows: MappedConsultantInterface[];
}
