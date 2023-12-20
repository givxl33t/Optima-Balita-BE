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
      const currUserId = req.user?.user_id;
      const users = await this.userService.getUsers(currUserId);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "Users successfully found", users));
    },
  );

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
