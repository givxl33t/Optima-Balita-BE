/* eslint-disable indent */
import DB from "@/config/database";
import sequelize from "sequelize";
import { metaBuilder } from "@/utils/pagination.utils";
import {
  ConsultantInterface,
  MappedConsultantInterface,
  PaginatedConsultantInterface,
} from "@/interfaces/consultation.interface";
import { CreateConsultantDto, UpdateConsultantDto } from "@/dtos/consultation.dto";
import { getRoleNameFromUserId } from "@/utils/role.utils";
import { HttpExceptionBadRequest } from "@/exceptions/HttpException";

class ConsultationService {
  public consultants = DB.ConsultantModel;
  public users = DB.UserModel;
  public roles = DB.RoleModel;

  public getConsultant = async (consultantId: string): Promise<MappedConsultantInterface> => {
    const consultant = await this.consultants.findByPk(consultantId, {
      include: [
        {
          model: this.users,
          as: "consultant",
          include: [
            {
              model: this.roles,
              as: "roles",
              attributes: ["name"],
            },
          ],
        },
      ],
    });
    if (!consultant) {
      throw new HttpExceptionBadRequest("Consultant not found");
    }
    return this.mappedConsultants([consultant])[0];
  };

  public getConsultants = async (
    offset: number,
    limit: number,
    filter?: string,
  ): Promise<PaginatedConsultantInterface> => {
    const consultants = await this.consultants.findAndCountAll({
      include: [
        {
          model: this.users,
          as: "consultant",
        },
      ],
      order: [["created_at", "DESC"]],
      where: filter
        ? {
            [sequelize.Op.or]: [
              { consultant_description: { [sequelize.Op.iLike]: `%${filter}%` } },
              { "$consultant.username$": { [sequelize.Op.iLike]: `%${filter}%` } },
            ],
          }
        : {},
      offset: !isNaN(offset) ? offset : undefined,
      limit: !isNaN(limit) ? limit : undefined,
    });

    const { rows, count } = consultants;
    const meta = !isNaN(offset) && !isNaN(limit) ? metaBuilder(offset, limit, count) : undefined;
    return { rows: this.mappedConsultants(rows), meta };
  };

  public createConsultant = async (
    consultantData: CreateConsultantDto,
  ): Promise<ConsultantInterface> => {
    const roleName = await getRoleNameFromUserId(consultantData.user_id);
    if (roleName !== "DOCTOR") {
      throw new HttpExceptionBadRequest("Provided user is not a health professional");
    }

    const consultant = await this.consultants.create({
      ...consultantData,
      consultant_id: consultantData.user_id,
    });
    return consultant;
  };

  public updateConsultant = async (
    consultantId: string,
    consultantData: UpdateConsultantDto,
  ): Promise<ConsultantInterface> => {
    const consultant = await this.consultants.findByPk(consultantId);
    if (!consultant) {
      throw new HttpExceptionBadRequest("Consultant not found");
    }

    await consultant.update(consultantData);
    return consultant;
  };

  public deleteConsultant = async (consultantId: string): Promise<ConsultantInterface> => {
    const consultant = await this.consultants.findByPk(consultantId);
    if (!consultant) {
      throw new HttpExceptionBadRequest("Consultant not found");
    }

    await consultant.destroy();
    return consultant;
  };

  public mappedConsultants = (consultants: ConsultantInterface[]): MappedConsultantInterface[] => {
    return consultants.map((consultant) => {
      if (consultant.consultant.roles) {
        return {
          id: consultant.id,
          consultant_description: consultant.consultant_description,
          consultant_phone: consultant.consultant_phone,
          consultant_id: consultant.consultant_id,
          consultant_username: consultant.consultant.username,
          consultant_profile: consultant.consultant.profile,
          consultant_role: consultant.consultant.roles[0].name,
          created_at: consultant.created_at,
        };
      }
      return {
        id: consultant.id,
        consultant_description: consultant.consultant_description,
        consultant_phone: consultant.consultant_phone,
        consultant_id: consultant.consultant_id,
        consultant_username: consultant.consultant.username,
        consultant_profile: consultant.consultant.profile,
        created_at: consultant.created_at,
      };
    });
  };
}

export default ConsultationService;
