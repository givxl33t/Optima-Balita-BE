import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import AuthService from "@/services/auth.service";
import { RegisterUserDto, LoginUserDto, TokenManageDto } from "@/dtos/auth.dto";
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

  public login = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: LoginUserDto = req.body;
    const tokens = await this.authService.login(userData);
    res.status(status.CREATED).json(tokens);
  });

  public refresh = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tokenData: TokenManageDto = req.body;
    const tokens = await this.authService.refresh(tokenData);
    res.status(status.OK).json(tokens);
  });

  public logout = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tokenData: TokenManageDto = req.body;
    await this.authService.logout(tokenData);
    res.status(status.OK).json(apiResponse(status.OK, "OK", "User successfully logged out"));
  });
}

export default AuthController;
