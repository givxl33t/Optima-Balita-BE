import { Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ConsultationService from "@/services/consultation.service";
import { AuthenticateRequest } from "@/interfaces/request.interface";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";

class ConsultationController {
  public consultationService = new ConsultationService();

  public getConsultant = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const consultantId = req.params.consultantId;
      const consultant = await this.consultationService.getConsultant(consultantId);
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Consultation successfully found", consultant));
    },
  );

  public getConsultants = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { limit, page, filter } = req.query;
      const offset: number = (Number(page) - 1) * Number(limit);
      const { rows, meta } = await this.consultationService.getConsultants(
        offset,
        Number(limit),
        filter as string,
      );
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Consultations successfully found", rows, meta));
    },
  );

  public createConsultant = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const consultantData = req.body;
      const createdConsultant = await this.consultationService.createConsultant(consultantData);
      res
        .status(status.CREATED)
        .json(
          apiResponse(
            status.CREATED,
            "CREATED",
            "Consultation successfully created",
            createdConsultant,
          ),
        );
    },
  );

  public updateConsultant = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const consultantId = req.params.consultantId;
      const consultantData = req.body;
      const updatedConsultant = await this.consultationService.updateConsultant(
        consultantId,
        consultantData,
      );
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Consultation successfully updated", updatedConsultant));
    },
  );

  public deleteConsultant = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const consultantId = req.params.consultantId;
      await this.consultationService.deleteConsultant(consultantId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Consultation successfully deleted"));
    },
  );
}

export default ConsultationController;
