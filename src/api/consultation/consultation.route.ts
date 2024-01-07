import { Router } from "express";
import ConsultationController from "@/api/consultation/consultation.controller";
import { RouteInterface } from "@/interfaces/routes.interface";
import { authenticate } from "@/middlewares/authentication.middleware";
import { authorize } from "@/middlewares/authorization.middleware";
import {
  GetConsultantsQueryDto,
  CreateConsultantDto,
  UpdateConsultantDto,
  ConsultantIdParamDto,
} from "@/dtos/consultation.dto";
import validationMiddleware from "@/middlewares/validation.middleware";
import { ADMIN_ID as ADMIN } from "@/utils/constant.utils";

class ConsultationRoute implements RouteInterface {
  public path = "/consultation";
  public router = Router();
  public consultationController = new ConsultationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/consultant/:consultantId`,
      authenticate,
      authorize([ADMIN]),
      validationMiddleware(ConsultantIdParamDto, "params"),
      this.consultationController.getConsultant,
    );
    this.router.get(
      `${this.path}/consultant`,
      authenticate,
      validationMiddleware(GetConsultantsQueryDto, "query"),
      this.consultationController.getConsultants,
    );
    this.router.post(
      `${this.path}/consultant`,
      authenticate,
      authorize([ADMIN]),
      validationMiddleware(CreateConsultantDto, "body"),
      this.consultationController.createConsultant,
    );
    this.router.put(
      `${this.path}/consultant/:consultantId`,
      authenticate,
      authorize([ADMIN]),
      validationMiddleware(ConsultantIdParamDto, "params"),
      validationMiddleware(UpdateConsultantDto, "body"),
      this.consultationController.updateConsultant,
    );
    this.router.delete(
      `${this.path}/consultant/:consultantId`,
      authenticate,
      authorize([ADMIN]),
      validationMiddleware(ConsultantIdParamDto, "params"),
      this.consultationController.deleteConsultant,
    );
  }
}

export default ConsultationRoute;
