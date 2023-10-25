import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import AuthService from "@/services/auth.service";
import { RegisterUserDto } from "@/dtos/auth.dto";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";

class AuthController {
  public authService = new AuthService();

  public register = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: RegisterUserDto = req.body;
    const registerUser = await this.authService.register(userData);
    res
      .status(status.CREATED)
      .json(apiResponse(status.CREATED, "CREATED", "User successfully registered", registerUser));
  });
}

export default AuthController;
