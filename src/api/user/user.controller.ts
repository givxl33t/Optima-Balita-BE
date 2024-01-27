import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import UserService from "@/services/user.service";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";
import { AuthenticateRequest } from "@/interfaces/request.interface";

class UserController {
  public userService = new UserService();

  public getUsers = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const { limit, page, filter } = req.query;
      const offset: number = (Number(page) - 1) * Number(limit);
      const currUserId = req.user?.user_id;
      const { rows, meta } = await this.userService.getUsers(
        offset,
        Number(limit),
        currUserId,
        filter as string,
      );
      res
        .status(status.OK)
        .json(apiResponse(status.OK, "OK", "Users successfully found", rows, meta));
    },
  );

  public getUser = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const user = await this.userService.getUser(userId);
    res.status(status.OK).json(apiResponse(status.OK, "OK", "User successfully found", user));
  });

  public updateUser = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData = req.body;
    const userId = req.params.userId;
    await this.userService.updateUser(userData, userId);
    res.status(status.OK).json(apiResponse(status.OK, "OK", "User successfully updated"));
  });

  public deleteUser = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    await this.userService.deleteUser(userId);
    res.status(status.OK).json(apiResponse(status.OK, "OK", "User successfully deleted"));
  });
}

export default UserController;
