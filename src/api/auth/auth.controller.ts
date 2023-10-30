import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import AuthService from "@/services/auth.service";
import { RegisterUserDto, LoginUserDto, TokenManageDto, UpdateUserDto } from "@/dtos/auth.dto";
import { StatusCodes as status } from "http-status-codes";
import { apiResponse } from "@/utils/apiResponse.utils";
import { AuthenticateRequest } from "@/interfaces/request.interface";

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

  public me = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const tokenPayload = req.user;
      const user = await this.authService.getUserById(tokenPayload?.user_id);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "User successfully found", user));
    },
  );

  public updateProfile = expressAsyncHandler(
    async (req: AuthenticateRequest, res: Response): Promise<void> => {
      const tokenPayload = req.user;
      const userData: UpdateUserDto = req.body;
      await this.authService.updateUser(userData, tokenPayload?.user_id);
      res.status(status.OK).json(apiResponse(status.OK, "OK", "User successfully updated"));
    },
  );
}

export default AuthController;
