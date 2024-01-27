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
      attributes: [
        "id",
        "consultant_description",
        "consultant_phone",
        "consultant_id",
        "created_at",
      ],
      include: [
        {
          model: this.users,
          as: "consultant",
          attributes: ["id", "username", "email", "profile", "created_at"],
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
    let meta;
    let consultants;

    const whereClause = {};

    if (filter) {
      whereClause[sequelize.Op.or] = [
        {
          "$consultant.username$": {
            [sequelize.Op.iLike]: `%${filter}%`,
          },
        },
        {
          consultant_description: {
            [sequelize.Op.iLike]: `%${filter}%`,
          },
        },
      ];
    }

    if (!isNaN(offset) && !isNaN(limit)) {
      consultants = await this.consultants.findAndCountAll({
        attributes: [
          "id",
          "consultant_description",
          "consultant_phone",
          "consultant_id",
          "created_at",
        ],
        where: whereClause,
        include: [
          {
            model: this.users,
            as: "consultant",
            attributes: ["id", "username", "email", "profile"],
          },
        ],
        offset,
        limit,
        order: [["created_at", "DESC"]],
      });

      const { rows, count } = consultants;
      meta = metaBuilder(offset, limit, count);
      return { rows: this.mappedConsultants(rows), meta };
    } else {
      consultants = await this.consultants.findAll({
        attributes: [
          "id",
          "consultant_description",
          "consultant_phone",
          "consultant_id",
          "created_at",
        ],
        where: whereClause,
        include: [
          {
            model: this.users,
            as: "consultant",
            attributes: ["id", "username", "email", "profile"],
          },
        ],
        order: [["created_at", "DESC"]],
      });
      return { rows: this.mappedConsultants(consultants), meta };
    }
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
